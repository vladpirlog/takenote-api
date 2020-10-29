import path from 'path'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import Note from '../src/models/Note'
import { INoteSchema } from '../src/types/Note'

describe('testing the security features of the api', () => {
    const request = supertest.agent(app)
    const pngTestImage = path.join(process.cwd(), 'test', 'img.png')
    let createdNoteID: INoteSchema['id']
    let authCookie: string

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()

        const res = await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.username,
                password: constants.test.persistentUser.password
            })
        authCookie = res.header['set-cookie'][0]

        const res2 = await request.post('/notes')
        createdNoteID = res2.body.note.id
    }, 30000)

    test('limit for # of tags per note', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tags: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20' })
        expect(res.status).toBe(200)
        const res2 = await request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tags: '21' })
        expect(res2.status).toBe(400)
    }, 20000)

    test('limit for # of attachments per note', async () => {
        const statuses: number[] = []
        for (let i = 0; i < 10; ++i) {
            const res = await request
                .post(`/notes/${createdNoteID}/attachments`)
                .field('title', 'my-title')
                .field('description', 'my-description')
                .attach('photo', pngTestImage, { contentType: 'image/png' })
            statuses.push(res.status)
        }
        expect(statuses).toEqual(new Array(statuses.length).fill(200))

        const res2 = await request
            .post(`/notes/${createdNoteID}/attachments`)
            .field('title', 'my-title')
            .field('description', 'my-description')
            .attach('photo', pngTestImage, { contentType: 'image/png' })
        expect(res2.status).toBe(400)
    }, 50000)

    test('jwt blacklisting', async () => {
        await request
            .post('/auth/logout')

        const res = await request
            .post('/auth/me')
            .set('Cookie', [authCookie])
        expect(res.status).toBe(500)
    }, 20000)

    // this test should be run independently from the others, because it would
    // deplete the requests allowed in the time frame; all the other
    // requests would get a 429 Too Many Requests error
    xtest('rate limiting for requests', async () => {
        const statuses: number[] = []
        while (true) {
            const res = await request.get('/')
            statuses.push(res.status)
            if (res.header['x-ratelimit-remaining-minute'] === '0') break
        }
        expect(statuses).toEqual(new Array(statuses.length).fill(200))
        expect((await request.get('/')).status).toBe(429)
    })

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID })
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
