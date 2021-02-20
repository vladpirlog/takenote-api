import path from 'path'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import { INoteSchema } from '../src/types/Note'
import { deleteTestUsers, registerTestUser } from './testingUtils'
import { DrawingBackgroundPattern, DrawingBrushType } from '../src/enums/Drawing.enum'
import Note from '../src/models/Note'
import { deleteFolderFromCloudStorage } from '../src/utils/cloudFileStorage.util'

describe('testing the security features of the api', () => {
    const request = supertest.agent(app)
    const pngTestImage = path.join(process.cwd(), 'test', 'media', 'test-image.png')
    let createdNoteID: INoteSchema['id']
    let authCookie: string
    let acceptedCredentials

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()

        acceptedCredentials = await registerTestUser(request)

        const res = await request
            .post('/auth/login')
            .send({
                email: acceptedCredentials.email,
                password: acceptedCredentials.password
            })
        authCookie = res.header['set-cookie'][0]

        const res2 = await request.post('/notes')
        createdNoteID = res2.body.note.id
    }, 30000)

    test('limit for # of tags per note', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tag: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20' })
        expect(res.status).toBe(200)
        const res2 = await request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tag: '21' })
        expect(res2.status).toBe(400)
    }, 20000)

    test('limit for # of attachments per note', async () => {
        const statuses: number[] = []
        for (let i = 0; i < 10; ++i) {
            const res = await request
                .post(`/notes/${createdNoteID}/attachments/image`)
                .field('title', 'my-title')
                .attach('image', pngTestImage)
            statuses.push(res.status)
        }
        expect(statuses).toEqual(new Array(statuses.length).fill(201))

        const res2 = await request
            .post(`/notes/${createdNoteID}/attachments/image`)
            .field('title', 'my-title')
            .attach('image', pngTestImage)
        expect(res2.status).toBe(400)
    }, 50000)

    test('limit for # of drawings per note', async () => {
        const statuses: number[] = []
        for (let i = 0; i < 10; ++i) {
            const res = await request
                .post(`/notes/${createdNoteID}/drawings`)
                .field('background_color', '#000000')
                .field('background_pattern', DrawingBackgroundPattern.NONE)
                .field('brush_color', '#ffffff')
                .field('brush_size', 5)
                .field('brush_type', DrawingBrushType.NORMAL)
                .field('variable_pen_pressure', 'true')
                .attach('drawing', pngTestImage)
            statuses.push(res.status)
        }
        expect(statuses).toEqual(new Array(statuses.length).fill(201))

        const res2 = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', pngTestImage)
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

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID }).exec()
        await deleteFolderFromCloudStorage(createdNoteID, constants.nodeEnv)
        await deleteTestUsers([acceptedCredentials.email])
        await mongodbConfig.close()
        await redisConfig.close()
    }, 30000)
})
