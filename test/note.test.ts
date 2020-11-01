import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import constants from '../src/config/constants.config'
import path from 'path'
import { INoteSchema } from '../src/types/Note'
import { IUserSchema } from '../src/types/User'
import Color from '../src/enums/Color.enum'
import { NoteRole } from '../src/utils/accessManagement.util'

describe('test note-related operations', () => {
    const request = supertest.agent(app)

    const pngTestImage: string = path.join(process.cwd(), 'test', 'img.png')
    let createdNoteID: INoteSchema['id']
    let duplicatedNoteID: INoteSchema['id']
    let createdNoteShareObject: INoteSchema['share']
    let attachmentID: INoteSchema['attachments'][0]['id']
    let collaboratorID: IUserSchema['id']
    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
        await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.email,
                password: constants.test.persistentUser.password
            })
    }, 30000)

    test('create note', async () => {
        const res = await request
            .post('/notes')
            .send({
                title: 'my-title',
                content: 'my-content'
            })
        createdNoteID = res.body.note.id
        expect(res.status).toBe(201)
        expect(res.body.note).toHaveProperty('id')
        expect(res.body.note.owner).toHaveProperty('id')
        expect(res.body.note.owner).toHaveProperty('username')
        expect(res.body.note.owner).toHaveProperty('email')
        expect(res.body.note.archived).toBe(false)
        expect(res.body.note.color).toBe(Color.DEFAULT)
        expect(res.body.note.fixed).toBe(false)
        expect(res.body.note).toHaveProperty('createdAt')
        expect(res.body.note).toHaveProperty('updatedAt')
        expect(res.body.note.title).toBe('my-title')
        expect(res.body.note.content).toBe('my-content')
    }, 20000)

    test('edit note title, content and color', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}`)
            .send({
                title: 'my-new-title',
                content: 'my-new-content',
                color: Color.RED
            })
        expect(res.status).toBe(200)
        expect(res.body.note.title).toBe('my-new-title')
        expect(res.body.note.content).toBe('my-new-content')
        expect(res.body.note.color).toBe(Color.RED)
    }, 20000)

    test('archive note', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}`)
            .send({ archived: 'true' })
        expect(res.status).toBe(200)
        expect(res.body.note.archived).toBe(true)
    }, 20000)

    test('unarchive note', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}`)
            .send({ archived: 'false' })
        expect(res.status).toBe(200)
        expect(res.body.note.archived).toBe(false)
    }, 20000)

    test('fix note', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}`)
            .send({ fixed: 'true' })
        expect(res.status).toBe(200)
        expect(res.body.note.fixed).toBe(true)
    }, 20000)

    test('unfix note', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}`)
            .send({ fixed: 'false' })
        expect(res.status).toBe(200)
        expect(res.body.note.fixed).toBe(false)
    }, 20000)

    test('duplicate note', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/duplicate`)
        duplicatedNoteID = res.body.note.id
        expect(res.status).toBe(200)
        expect(res.body.note.title).toBe('my-new-title')
        expect(res.body.note.content).toBe('my-new-content')
        expect(res.body.note.id).not.toBe(createdNoteID)
    }, 20000)

    test('add tags', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/tags`)
            .query({ tag: 'tag1,tag2,tag3' })
        expect(res.status).toBe(200)
        expect(res.body.tags).toEqual(['tag1', 'tag2', 'tag3'])
    }, 20000)

    test('get by exact tag which exists', async () => {
        const res = await request
            .get('/notes/tags')
            .query({ tag: 'tag2', match: 'true' })
        expect(res.status).toBe(200)
        expect(res.body.notes.length).toBe(1)
    }, 20000)

    test('get by exact tag which doesn\'t exist', async () => {
        const res = await request
            .get('/notes/tags')
            .query({ tag: 'abc', match: 'true' })
        expect(res.status).toBe(200)
        expect(res.body.notes.length).toBe(0)
    }, 20000)

    test('get by regexp tag which exists', async () => {
        const res = await request
            .get('/notes/tags')
            .query({ tag: 'ag' })
        expect(res.status).toBe(200)
        expect(res.body.notes.length).toBe(1)
    }, 20000)

    test('get by regexp tag which doesn\'t exist', async () => {
        const res = await request
            .get('/notes/tags')
            .query({ tag: 'abc' })
        expect(res.status).toBe(200)
        expect(res.body.notes.length).toBe(0)
    }, 20000)

    test('delete tags', async () => {
        const res = await request
            .delete(`/notes/${createdNoteID}/tags`)
            .query({ tag: 'tag3,tag4' })
        expect(res.status).toBe(200)
    }, 20000)

    test('add collaborator using its username', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/share/collaborators`)
            .send({
                user: constants.test.persistentUser2.username,
                type: NoteRole.OBSERVER
            })
        collaboratorID = res.body.collaborator.subject.id
        expect(res.status).toBe(200)
        expect(res.body.collaborator.roles).toEqual([NoteRole.OBSERVER])
        expect(res.body.collaborator.subject).toHaveProperty('id')
        expect(res.body.collaborator.subject).toHaveProperty('username')
        expect(res.body.collaborator.subject).toHaveProperty('email')
    }, 20000)

    test('edit collaborator using its email', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/share/collaborators`)
            .send({
                user: constants.test.persistentUser2.email,
                type: NoteRole.PRIMARY_COLLABORATOR
            })
        expect(res.status).toBe(200)
        expect(res.body.collaborator.roles).toEqual([NoteRole.PRIMARY_COLLABORATOR])
        expect(res.body.collaborator.subject).toHaveProperty('id')
        expect(res.body.collaborator.subject).toHaveProperty('username')
        expect(res.body.collaborator.subject).toHaveProperty('email')
    }, 20000)

    test('delete self from own note', async () => {
        const res = await request
            .delete(`/notes/${createdNoteID}/share/collaborators`)
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('delete collaborator', async () => {
        const res = await request
            .delete(`/notes/${createdNoteID}/share/collaborators/${collaboratorID}`)
        expect(res.status).toBe(200)
    }, 20000)

    test('get sharing link and set it active', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/share`)
            .query({ active: true })
        createdNoteShareObject = res.body.share
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('share')
        expect(res.body.share).toHaveProperty('code')
        expect(res.body.share).toHaveProperty('active')
    }, 20000)

    test('get shared note with the URL provided', async () => {
        const res = await request.get(`/shared/${createdNoteShareObject.code}`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('note')
    }, 20000)

    test('get new sharing link and set it inactive', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/share`)
            .query({ active: false, get_new: true })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('share')
        expect(res.body.share).toHaveProperty('code')
        expect(res.body.share).toHaveProperty('active')
        expect(res.body.share.code).not.toBe(createdNoteShareObject.code)
    }, 20000)

    test('add attachment', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/attachments`)
            .field('title', 'my-title')
            .field('description', 'my-description')
            .attach('photo', pngTestImage, { contentType: 'image/png' })
        attachmentID = res.body.attachment.id
        expect(res.status).toBe(200)
        expect(res.body.attachment.title).toBe('my-title')
        expect(res.body.attachment.description).toBe('my-description')
        expect(res.body.attachment).toHaveProperty('id')
        expect(res.body.attachment).toHaveProperty('url')
    }, 20000)

    test('edit attachment', async () => {
        const res = await request
            .put(`/notes/${createdNoteID}/attachments/${attachmentID}`)
            .send({
                title: 'my-new-title',
                description: 'my-new-description'
            })
        expect(res.status).toBe(200)
        expect(res.body.attachment.title).toBe('my-new-title')
        expect(res.body.attachment.description).toBe('my-new-description')
        expect(res.body.attachment).toHaveProperty('id')
        expect(res.body.attachment).toHaveProperty('url')
    }, 20000)

    test('delete attachment', async () => {
        const res = await request
            .delete(`/notes/${createdNoteID}/attachments/${attachmentID}`)
        expect(res.status).toBe(200)
    }, 20000)

    test('get note', async () => {
        const res = await request.get(`/notes/${createdNoteID}`)
        expect(res.status).toBe(200)
        expect(res.body.note).toHaveProperty('id')
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
        expect(res.body.note.fixed).toBe(false)
        expect(res.body.note.owner).toHaveProperty('id')
        expect(res.body.note.owner).toHaveProperty('username')
        expect(res.body.note.owner).toHaveProperty('email')
        expect(res.body.note.collaborators).toEqual([])
    }, 20000)

    test('delete note', async () => {
        const res = await request.delete(`/notes/${createdNoteID}`)
        expect(res.status).toBe(200)
    }, 20000)

    test('delete duplicated note', async () => {
        const res = await request.delete(`/notes/${duplicatedNoteID}`)
        expect(res.status).toBe(200)
    }, 20000)

    afterAll(async () => {
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
