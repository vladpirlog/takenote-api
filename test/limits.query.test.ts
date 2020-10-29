import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import limitsQuery from '../src/queries/limits.query'
import { INoteSchema } from '../src/types/Note'
import { IUserSchema } from '../src/types/User'
import path from 'path'
import { NoteRole } from '../src/utils/accessManagement.util'

describe('test queries for limit-checking', () => {
    const request = supertest.agent(app)
    const pngTestImage = path.join(process.cwd(), 'test', 'img.png')
    let userID: IUserSchema['id']
    const createdNotesID: INoteSchema['id'][] = []

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
        const res = await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser2.email,
                password: constants.test.persistentUser2.password
            })
        userID = res.body.user.id
    }, 20000)

    test('get number of notes owned - should be 0', async () => {
        const n = await limitsQuery.note(userID)
        expect(n).toBe(0)
    })

    test.each([1, 2, 3])('get number of notes owned - should be %d', async (expectedN) => {
        const res = await request.post('/notes')
        createdNotesID.push(res.body.note.id)
        const n = await limitsQuery.note(userID)
        expect(n).toBe(expectedN)
    })

    test('get number of attachments - should be 0', async () => {
        const n = await limitsQuery.attachment(createdNotesID[0])
        expect(n).toBe(0)
    })

    test.each([1, 2, 3])('get number of attachments - should be %d', async (expectedN) => {
        await request
            .post(`/notes/${createdNotesID[0]}/attachments`)
            .attach('photo', pngTestImage, { contentType: 'image/png' })
        const n = await limitsQuery.attachment(createdNotesID[0])
        expect(n).toBe(expectedN)
    })

    test('get number of tags - should be 0', async () => {
        const n = await limitsQuery.tag(createdNotesID[0], userID)
        expect(n).toBe(0)
    })

    test.each([1, 2, 3])('get number of tags - should be %d', async (expectedN) => {
        await request
            .post(`/notes/${createdNotesID[0]}/tags`)
            .query({ tags: `tag${expectedN}` })
        const n = await limitsQuery.tag(createdNotesID[0], userID)
        expect(n).toBe(expectedN)
    })

    test('get number of collaborators - should be 0', async () => {
        const n = await limitsQuery.collaborator(createdNotesID[0])
        expect(n).toBe(0)
    })

    test('get number of collaborators - should be 1', async () => {
        await request
            .post(`/notes/${createdNotesID[0]}/share/collaborators`)
            .send({
                user: constants.test.persistentUser.username,
                type: NoteRole.OBSERVER
            })
        const n = await limitsQuery.collaborator(createdNotesID[0])
        expect(n).toBe(1)
    })

    afterAll(async () => {
        await Promise.all(createdNotesID.map(id => request.delete(`/notes/${id}`)))
        await mongodbConfig.close()
        await redisConfig.close()
    }, 20000)
})
