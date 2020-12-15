import supertest from 'supertest'
import app from '../src/app'
import path from 'path'
import mongodbConfig from '../src/config/mongodb.config'
import constants from '../src/config/constants.config'
import redisConfig from '../src/config/redis.config'
import { deleteTestUsers, registerTestUser } from './testingUtils'
import { DrawingBackgroundPattern, DrawingBrushType } from '../src/enums/Drawing.enum'
import { deleteFolderFromCloudStorage } from '../src/utils/cloudFileStorage.util'
import Note from '../src/models/Note'

describe('test drawing-related operations', () => {
    const request = supertest.agent(app)
    const testImage = {
        accepted: {
            png: path.join(process.cwd(), 'test', 'media', 'test-image.png')
        },
        rejected: {
            jpg: path.join(process.cwd(), 'test', 'media', 'test-image.jpg'),
            gif: path.join(process.cwd(), 'test', 'media', 'test-image.gif'),
            bmp: path.join(process.cwd(), 'test', 'media', 'test-image.bmp'),
            ico: path.join(process.cwd(), 'test', 'media', 'test-image.ico')
        }
    }
    let acceptedCredentials, createdNoteID

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()

        acceptedCredentials = await registerTestUser(request)
        await request
            .post('/auth/login')
            .send({
                email: acceptedCredentials.email,
                password: acceptedCredentials.password
            })
        const res = await request.post('/notes')
        createdNoteID = res.body.note.id
    }, 20000)

    test.each(['png'])('should accept %s drawing format', async format => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted[format])
        expect(res.body.status).toBe(201)
        expect(res.body.drawing).toBeDefined()
    }, 20000)

    test.each(['jpg', 'gif', 'bmp', 'ico'])('should reject %s drawing format', async format => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.rejected[format])
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect background color', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', 'temp')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect background pattern', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', 'temp')
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect brush color', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', 'temp')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect brush size', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 'temp')
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect brush type', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', 'temp')
            .field('variable_pen_pressure', 'true')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should reject incorrect variable pen pressure', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/drawings`)
            .field('background_color', '#000000')
            .field('background_pattern', DrawingBackgroundPattern.NONE)
            .field('brush_color', '#ffffff')
            .field('brush_size', 5)
            .field('brush_type', DrawingBrushType.NORMAL)
            .field('variable_pen_pressure', 'temp')
            .attach('drawing', testImage.accepted.png)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID }).exec()
        await deleteFolderFromCloudStorage(createdNoteID, constants.nodeEnv)
        deleteTestUsers([acceptedCredentials.email])
        await redisConfig.close()
        await mongodbConfig.close()
    }, 20000)
})
