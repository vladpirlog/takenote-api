import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import { ICommentSchema } from '../src/types/Comment'
import { INoteSchema } from '../src/types/Note'

describe('test note comment-related operations', () => {
    const request = supertest.agent(app)
    let createdNoteID: INoteSchema['id']
    let createdCommentID: ICommentSchema['id']

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
        await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.email,
                password: constants.test.persistentUser.password
            })
        const res = await request.post('/notes')
        createdNoteID = res.body.note.id
    }, 30000)

    test('add comment', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/comments`)
            .send({ text: 'my-comment' })
        createdCommentID = res.body.comment.id
        expect(res.body.status).toBe(201)
        expect(res.body.comment.id).toBeDefined()
        expect(res.body.comment.subject.id).toBeDefined()
        expect(res.body.comment.subject.username).toBe(constants.test.persistentUser.username)
        expect(res.body.comment.subject.email).toBe(constants.test.persistentUser.email)
        expect(res.body.comment.text).toBe('my-comment')
        expect(res.body.comment.createdAt).toBeDefined()
        expect(res.body.comment.updatedAt).toBeDefined()
    })

    test('edit comment', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}/comments/${createdCommentID}`)
            .send({ text: 'my-new-comment' })
        expect(res.body.status).toBe(200)
        expect(res.body.comment.id).toBe(createdCommentID)
        expect(res.body.comment.subject.id).toBeDefined()
        expect(res.body.comment.subject.username).toBe(constants.test.persistentUser.username)
        expect(res.body.comment.subject.email).toBe(constants.test.persistentUser.email)
        expect(res.body.comment.text).toBe('my-new-comment')
        expect(res.body.comment.createdAt).toBeDefined()
        expect(res.body.comment.updatedAt).toBeDefined()
    })

    test('get comment', async () => {
        const res = await request
            .get(`/notes/${createdNoteID}/comments/${createdCommentID}`)
        expect(res.body.status).toBe(200)
        expect(res.body.comment.id).toBe(createdCommentID)
        expect(res.body.comment.subject.id).toBeDefined()
        expect(res.body.comment.subject.username).toBe(constants.test.persistentUser.username)
        expect(res.body.comment.subject.email).toBe(constants.test.persistentUser.email)
        expect(res.body.comment.text).toBe('my-new-comment')
        expect(res.body.comment.createdAt).toBeDefined()
        expect(res.body.comment.updatedAt).toBeDefined()
    })

    test('get all comments', async () => {
        const res = await request
            .get(`/notes/${createdNoteID}/comments`)
        expect(res.body.status).toBe(200)
        expect(res.body.comments.enabled).toBeTruthy()
        expect(res.body.comments.items).toHaveLength(1)
        expect(res.body.comments.items[0].text).toBe('my-new-comment')
    })

    test('disable comment section', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/comments/state`)
            .query({ enabled: 'false' })
        expect(res.body.status).toBe(200)
    })

    test('enable comment section', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/comments/state`)
            .query({ enabled: 'true' })
        expect(res.body.status).toBe(200)
    })

    test('delete comment', async () => {
        const res = await request
            .delete(`/notes/${createdNoteID}/comments/${createdCommentID}`)
        expect(res.body.status).toBe(200)
    })

    afterAll(async () => {
        await request.delete(`/notes/${createdNoteID}`)
        await mongodbConfig.close()
        await redisConfig.close()
    }, 20000)
})
