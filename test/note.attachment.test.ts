import redisConfig from '../src/config/redis.config'
import mongodbConfig from '../src/config/mongodb.config'
import supertest from 'supertest'
import app from '../src/app'
import path from 'path'
import { deleteTestUsers, registerTestUser } from './testingUtils'
import { AttachmentType } from '../src/enums/AttachmentType.enum'
import constants from '../src/config/constants.config'
import Note from '../src/models/Note'
import { deleteFolderFromCloudStorage } from '../src/utils/cloudFileStorage.util'

describe('testing attachments of different types', () => {
    const request = supertest.agent(app)
    let acceptedCredentials
    let createdNoteID: string

    const testImage = {
        accepted: {
            png: path.join(process.cwd(), 'test', 'media', 'test-image.png'),
            jpg: path.join(process.cwd(), 'test', 'media', 'test-image.jpg')
        },
        rejected: {
            gif: path.join(process.cwd(), 'test', 'media', 'test-image.gif'),
            bmp: path.join(process.cwd(), 'test', 'media', 'test-image.bmp'),
            ico: path.join(process.cwd(), 'test', 'media', 'test-image.ico')
        }
    }

    const testAudio = {
        accepted: {
            webm: path.join(process.cwd(), 'test', 'media', 'test-audio.webm'),
            wav: path.join(process.cwd(), 'test', 'media', 'test-audio.wav'),
            aac: path.join(process.cwd(), 'test', 'media', 'test-audio.aac'),
            ogg: path.join(process.cwd(), 'test', 'media', 'test-audio.ogg'),
            mp3: path.join(process.cwd(), 'test', 'media', 'test-audio.mp3')
        }
    }

    beforeAll(async () => {
        redisConfig.connect()
        await mongodbConfig.connect(constants.test.mongodbURI)

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

    test.each(['png', 'jpg'])('should accept %s image', async format => {
        const res = await request
            .post(`/notes/${createdNoteID}/attachments/image`)
            .attach('image', testImage.accepted[format])
        expect(res.body.status).toBe(201)
        expect(res.body.attachment.type).toBe(AttachmentType.IMAGE)
    }, 20000)

    test.each(['gif', 'bmp', 'ico'])('should reject %s image', async format => {
        const res = await request
            .post(`/notes/${createdNoteID}/attachments/image`)
            .attach('image', testImage.rejected[format])
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test.each(['webm', 'wav', 'aac', 'ogg', 'mp3'])('should accept %s audio', async format => {
        const res = await request
            .post(`/notes/${createdNoteID}/attachments/audio`)
            .attach('audio', testAudio.accepted[format])
        expect(res.body.status).toBe(201)
        expect(res.body.attachment.type).toBe(AttachmentType.AUDIO)
    }, 20000)

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID }).exec()
        await deleteFolderFromCloudStorage(createdNoteID, constants.nodeEnv)
        await deleteTestUsers([acceptedCredentials.email])
        await redisConfig.close()
        await mongodbConfig.close()
    }, 20000)
})
