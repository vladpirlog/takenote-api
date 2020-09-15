import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import constants from '../src/config/constants.config'
import { INoteSchema } from '../src/models/Note'
import { PermissionLevel } from '../src/models/Permission'
import path from 'path'
import { Color } from '../src/interfaces/color.enum'

describe('test note-related operations', () => {
    const request = supertest.agent(app)

    const pngTestImage: string = path.join(process.cwd(), 'test', 'img.png')
    let createdNoteID: INoteSchema['_id']
    let createdNoteShareObject: INoteSchema['share']
    let permissionID: INoteSchema['permissions'][0]['_id']
    let attachmentID: INoteSchema['attachments'][0]['_id']
    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        await redisConfig.connect()
        await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.email,
                password: constants.test.persistentUser.password
            })
    })

    test('create note', (done) => {
        request
            .post('/notes')
            .send({
                title: 'my-title',
                content: 'my-content'
            })
            .then((res) => {
                createdNoteID = res.body.note._id
                expect(res.status).toBe(201)
                expect(res.body.note).toHaveProperty('_id')
                expect(res.body.note).toHaveProperty('owner')
                expect(res.body.note).toHaveProperty('archived')
                expect(res.body.note).toHaveProperty('createdAt')
                expect(res.body.note).toHaveProperty('updatedAt')
                expect(res.body.note.title).toBe('my-title')
                expect(res.body.note.content).toBe('my-content')
                return done()
            })
    }, 20000)

    test('edit note title, content and color', (done) => {
        request
            .put(`/notes/${createdNoteID}`)
            .send({
                title: 'my-new-title',
                content: 'my-new-content',
                color: Color.RED
            })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.note.title).toBe('my-new-title')
                expect(res.body.note.content).toBe('my-new-content')
                expect(res.body.note.color).toBe(Color.RED)
                return done()
            })
    }, 20000)

    test('archive note', (done) => {
        request
            .put(`/notes/${createdNoteID}`)
            .send({ archived: 'true' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.note.archived).toBe(true)
                return done()
            })
    }, 20000)

    test('unarchive note', (done) => {
        request
            .put(`/notes/${createdNoteID}`)
            .send({ archived: 'false' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.note.archived).toBe(false)
                return done()
            })
    }, 20000)

    test('duplicate note', (done) => {
        request
            .post(`/notes/${createdNoteID}/duplicate`)
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.note.title).toBe('my-new-title')
                expect(res.body.note.content).toBe('my-new-content')
                expect(res.body.note._id).not.toBe(createdNoteID)
                return done()
            })
    }, 20000)

    test('add tags', (done) => {
        request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tags: 'tag1,tag2,tag3' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.tags).toEqual(['tag1', 'tag2', 'tag3'])
                return done()
            })
    }, 20000)

    test('get by exact tag which exists', (done) => {
        request
            .get('/notes/tags')
            .query({ tag: 'tag2', match: 'true' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.notes.length).toBe(1)
                return done()
            })
    }, 20000)

    test('get by exact tag which doesn\'t exist', (done) => {
        request
            .get('/notes/tags')
            .query({ tag: 'abc', match: 'true' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.notes.length).toBe(0)
                return done()
            })
    }, 20000)

    test('get by regexp tag which exists', (done) => {
        request
            .get('/notes/tags')
            .query({ tag: 'ag' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.notes.length).toBe(1)
                return done()
            })
    }, 20000)

    test('get by regexp tag which doesn\'t exist', (done) => {
        request
            .get('/notes/tags')
            .query({ tag: 'abc' })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.notes.length).toBe(0)
                return done()
            })
    }, 20000)

    test('delete tags', (done) => {
        request
            .delete(`/notes/${createdNoteID}/tags`)
            .query({ tags: 'tag3,tag4' })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('add collaborator', (done) => {
        request
            .post(`/notes/${createdNoteID}/share/collaborators`)
            .send({
                user: constants.test.persistentUser2.username,
                type: 'r'
            })
            .then((res) => {
                permissionID = res.body.permission._id
                expect(res.status).toBe(200)
                expect(res.body.permission.level).toBe(PermissionLevel.read)
                expect(res.body.permission).toHaveProperty('subject')
                expect(res.body.permission).toHaveProperty('_id')
                return done()
            })
    }, 20000)

    test('edit collaborator', (done) => {
        request
            .post(`/notes/${createdNoteID}/share/collaborators`)
            .send({
                user: constants.test.persistentUser2.email,
                type: 'rw'
            })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.permission.level).toBe(PermissionLevel.readWrite)
                expect(res.body.permission).toHaveProperty('subject')
                expect(res.body.permission).toHaveProperty('_id')
                return done()
            })
    }, 20000)

    test('delete collaborator', (done) => {
        request
            .delete(`/notes/${createdNoteID}/share/collaborators/${permissionID}`)
            .send({
                user: constants.test.persistentUser2.email,
                type: 'rw'
            })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('get sharing link and set it active', (done) => {
        request
            .post(`/notes/${createdNoteID}/share`)
            .query({ active: true })
            .then((res) => {
                createdNoteShareObject = res.body.share
                expect(res.status).toBe(200)
                expect(res.body).toHaveProperty('share')
                expect(res.body.share).toHaveProperty('code')
                expect(res.body.share).toHaveProperty('active')
                return done()
            })
    }, 20000)

    test('get shared note with the URL provided', (done) => {
        request.get(`/shared/${createdNoteShareObject.code}`).then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('note')
            return done()
        })
    }, 20000)

    test('get new sharing link and set it inactive', (done) => {
        request
            .post(`/notes/${createdNoteID}/share`)
            .query({ active: false, get_new: true })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body).toHaveProperty('share')
                expect(res.body.share).toHaveProperty('code')
                expect(res.body.share).toHaveProperty('active')
                expect(res.body.share.code).not.toBe(createdNoteShareObject.code)
                return done()
            })
    }, 20000)

    test('add attachment', (done) => {
        request
            .post(`/notes/${createdNoteID}/attachments`)
            .field('title', 'my-title')
            .field('description', 'my-description')
            .attach('photo', pngTestImage, { contentType: 'image/png' })
            .then((res) => {
                attachmentID = res.body.attachment._id
                expect(res.status).toBe(200)
                expect(res.body.attachment.title).toBe('my-title')
                expect(res.body.attachment.description).toBe('my-description')
                expect(res.body.attachment).toHaveProperty('_id')
                expect(res.body.attachment).toHaveProperty('url')
                return done()
            })
    }, 20000)

    test('edit attachment', (done) => {
        request
            .put(`/notes/${createdNoteID}/attachments/${attachmentID}`)
            .send({
                title: 'my-new-title',
                description: 'my-new-description'
            })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body.attachment.title).toBe('my-new-title')
                expect(res.body.attachment.description).toBe('my-new-description')
                expect(res.body.attachment).toHaveProperty('_id')
                expect(res.body.attachment).toHaveProperty('url')
                return done()
            })
    }, 20000)

    test('delete attachment', (done) => {
        request
            .delete(`/notes/${createdNoteID}/attachments/${attachmentID}`)
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('get note', (done) => {
        request.get(`/notes/${createdNoteID}`).then((res) => {
            expect(res.status).toBe(200)
            expect(res.body.note).toHaveProperty('_id')
            expect(res.body.note).toHaveProperty('owner')
            expect(res.body.note).toHaveProperty('createdAt')
            expect(res.body.note).toHaveProperty('updatedAt')
            expect(res.body.note).toHaveProperty('tags')
            expect(res.body.note).toHaveProperty('share')
            expect(res.body.note.title).toBe('my-new-title')
            expect(res.body.note.content).toBe('my-new-content')
            expect(res.body.note.color).toBe(Color.RED)
            expect(res.body.note.tags).toEqual(['tag1', 'tag2'])
            expect(res.body.note.share).toHaveProperty('code')
            expect(res.body.note.share).toHaveProperty('active')
            expect(res.body.note.archived).toBe(false)
            return done()
        })
    }, 20000)

    test('delete note', (done) => {
        request.delete(`/notes/${createdNoteID}`).then((res) => {
            expect(res.status).toBe(200)
            return done()
        })
    }, 20000)

    afterAll(async () => {
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
