import supertest from 'supertest'
import app from '../src/app'
import redisConfig from '../src/config/redis.config'
import mongodbConfig from '../src/config/mongodb.config'
import constants from '../src/config/constants.config'
import { INotepadSchema } from '../src/types/Notepad'
import { Role } from '../src/enums/Role.enum'
import { IUserSchema } from '../src/types/User'
import { INoteSchema } from '../src/types/Note'
import { deleteTestUsers, registerTestUser } from './testingUtils'
import { deleteFolderFromCloudStorage } from '../src/utils/cloudFileStorage.util'
import Note from '../src/models/Note'

describe('test notepad-related operations', () => {
    const request = supertest.agent(app)
    let createdNotepadID: INotepadSchema['id']
    let secondCreatedNotepadID: INotepadSchema['id']
    let collaboratorID: IUserSchema['id']
    let createdNoteID: INoteSchema['id']
    let shareCode: INotepadSchema['share']['code']
    let acceptedCredentials1
    let acceptedCredentials2

    beforeAll(async () => {
        redisConfig.connect()
        await mongodbConfig.connect(constants.test.mongodbURI)

        acceptedCredentials1 = await registerTestUser(request)
        acceptedCredentials2 = await registerTestUser(request)

        await request
            .post('/auth/login')
            .send({
                email: acceptedCredentials1.email,
                password: acceptedCredentials1.password
            })
    }, 20000)

    test('should create a new empty notepad', async () => {
        const res = await request.post('/notepads')
        const notepad = res.body.notepad
        createdNotepadID = notepad.id
        expect(res.body.status).toBe(201)
        expect(notepad).toHaveProperty('id')
        expect(notepad).toHaveProperty('owner')
        expect(notepad).toHaveProperty('share')
        expect(notepad).toHaveProperty('createdAt')
        expect(notepad).toHaveProperty('updatedAt')
        expect(notepad.share.active).toBeFalsy()
        expect(notepad.owner.email).toBe(acceptedCredentials1.email)
        expect(notepad.notes).toBeUndefined()
        expect(notepad.collaborators).toEqual([])
    }, 20000)

    test('should edit an existing notepad', async () => {
        const res = await request
            .put(`/notepads/${createdNotepadID}`)
            .send({ title: 'my-title' })
        const notepad = res.body.notepad
        expect(res.body.status).toBe(200)
        expect(notepad).toHaveProperty('id')
        expect(notepad).toHaveProperty('owner')
        expect(notepad).toHaveProperty('share')
        expect(notepad).toHaveProperty('createdAt')
        expect(notepad).toHaveProperty('updatedAt')
        expect(notepad.title).toBe('my-title')
        expect(notepad.share.active).toBeFalsy()
        expect(notepad.owner.email).toBe(acceptedCredentials1.email)
        expect(notepad.notes).toBeUndefined()
        expect(notepad.collaborators).toEqual([])
    }, 20000)

    test('should modify sharing properties of a notepad', async () => {
        const res = await request
            .post(`/notepads/${createdNotepadID}/share`)
            .query({ active: true })
        shareCode = res.body.share.code
        expect(res.body.status).toBe(200)
        expect(res.body.share.active).toBeTruthy()
        expect(typeof res.body.share.code).toBe('string')
    }, 20000)

    test('should fetch a shared notepad using the code', async () => {
        const res = await request.get(`/shared/notepad/${shareCode}`)
        expect(res.body.status).toBe(200)
        expect(res.body.notepad).toBeDefined()
        const notepad = res.body.notepad

        expect(notepad).toHaveProperty('id')
        expect(notepad).toHaveProperty('owner')
        expect(notepad).toHaveProperty('createdAt')
        expect(notepad).toHaveProperty('updatedAt')
        expect(notepad).toHaveProperty('title')
        expect(notepad).toHaveProperty('notes')
    }, 20000)

    test('should add a collaborator to a notepad', async () => {
        const res = await request
            .post(`/notepads/${createdNotepadID}/share/collaborators`)
            .send({
                user: acceptedCredentials2.email,
                type: Role.OBSERVER
            })
        const collaborator = res.body.collaborator
        collaboratorID = collaborator.subject.id
        expect(res.body.status).toBe(200)
        expect(collaborator.roles).toEqual([Role.OBSERVER])
        expect(collaborator.subject.email).toBe(acceptedCredentials2.email)
        expect(collaborator.subject.username).toBe(acceptedCredentials2.username)
    }, 20000)

    test('should not add self as a collaborator to a notepad', async () => {
        const res = await request
            .post(`/notepads/${createdNotepadID}/share/collaborators`)
            .send({
                user: acceptedCredentials1.email,
                type: Role.PRIMARY_COLLABORATOR
            })
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should change the role of a notepad collaborator', async () => {
        const res = await request
            .post(`/notepads/${createdNotepadID}/share/collaborators`)
            .send({
                user: acceptedCredentials2.username,
                type: Role.SECONDARY_COLLABORATOR
            })
        const collaborator = res.body.collaborator
        expect(res.body.status).toBe(200)
        expect(collaborator.roles).toEqual([Role.SECONDARY_COLLABORATOR])
        expect(collaborator.subject.email).toBe(acceptedCredentials2.email)
        expect(collaborator.subject.username).toBe(acceptedCredentials2.username)
    }, 20000)

    test('should add a new note to a notepad', async () => {
        const res = await request
            .post(`/notepads/${createdNotepadID}/notes`)
            .send({
                title: 'my-title',
                content: 'my-content'
            })
        const note = res.body.note
        expect(res.body.status).toBe(201)
        expect(note).toHaveProperty('id')
        expect(note).toHaveProperty('createdAt')
        expect(note).toHaveProperty('updatedAt')
        expect(note).toHaveProperty('owner')
        expect(note).toHaveProperty('comments')
        expect(note.owner.email).toBe(acceptedCredentials1.email)
        expect(note.owner.username).toBe(acceptedCredentials1.username)
        expect(note.title).toBe('my-title')
        expect(note.content).toBe('my-content')
        expect(note.archived).toBeFalsy()
        expect(note.fixed).toBeFalsy()
        expect(note.tags).toEqual([])
        expect(note.comments.enabled).toBeTruthy()
        expect(note.comments.items).toEqual([])
        expect(note.attachments).toEqual([])
        expect(note.collaborators).toBeUndefined()
        expect(note.share).toBeUndefined()
    }, 20000)

    test('should create a new note and move it to the notepad', async () => {
        const res1 = await request.post('/notes')
        createdNoteID = res1.body.note.id
        expect(res1.body.status).toBe(201)

        const res2 = await request
            .post(`/notes/${createdNoteID}/move`)
            .query({ to: createdNotepadID })
        expect(res2.body.status).toBe(200)
    }, 20000)

    test('should fetch one notepad, alongside the notes inside', async () => {
        const res = await request.get(`/notepads/${createdNotepadID}`)
        expect(res.body.status).toBe(200)
        const notepad = res.body.notepad
        expect(notepad).toHaveProperty('id')
        expect(notepad).toHaveProperty('owner')
        expect(notepad).toHaveProperty('share')
        expect(notepad).toHaveProperty('createdAt')
        expect(notepad).toHaveProperty('updatedAt')
        expect(notepad.title).toBe('my-title')
        expect(notepad.share.active).toBeTruthy()
        expect(notepad.owner.email).toBe(acceptedCredentials1.email)
        expect(notepad.collaborators.length).toBe(1)
        expect(notepad.collaborators[0].subject.email).toBe(acceptedCredentials2.email)
        expect(notepad.collaborators[0].subject.username).toBe(acceptedCredentials2.username)
        expect(notepad.collaborators[0].roles).toEqual([Role.SECONDARY_COLLABORATOR])
        expect(notepad.notes.length).toBe(2)

        for (const note of notepad.notes) {
            expect(note).toHaveProperty('id')
            expect(note).toHaveProperty('createdAt')
            expect(note).toHaveProperty('updatedAt')
            expect(note).toHaveProperty('owner')
            expect(note).toHaveProperty('comments')
            expect(note).toHaveProperty('title')
            expect(note).toHaveProperty('content')
            expect(note).toHaveProperty('archived')
            expect(note).toHaveProperty('fixed')
            expect(note).toHaveProperty('tags')
            expect(note.owner.email).toBe(acceptedCredentials1.email)
            expect(note.owner.username).toBe(acceptedCredentials1.username)
            expect(note.comments.enabled).toBeTruthy()
            expect(note.comments.items).toEqual([])
            expect(note.attachments).toEqual([])
            expect(note.collaborators).toBeUndefined()
            expect(note.share).toBeUndefined()
        }
    }, 20000)

    test('should move one note from notepad to personal notes', async () => {
        const res = await request
            .post(`/notes/${createdNoteID}/move`)
            .query({ to: 'default' })
        expect(res.body.status).toBe(200)
    }, 20000)

    test('should create one more notepad and fetch all notepads', async () => {
        const res1 = await request.post('/notepads')
        secondCreatedNotepadID = res1.body.notepad.id

        const res2 = await request.get('/notepads')
        const notepads = res2.body.notepads
        expect(res2.body.status).toBe(200)
        expect(notepads.length).toBe(2)
        expect(notepads[0].notes.length).toBe(1)
        expect(notepads[1].notes.length).toBe(0)
    }, 20000)

    test('should not delete self as a notepad collaborator', async () => {
        const res = await request.delete(`/notepads/${createdNotepadID}/share/collaborators`)
        expect(res.body.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('should delete collaborator from a notepad', async () => {
        const res = await request.delete(`/notepads/${createdNotepadID}/share/collaborators/${collaboratorID}`)
        expect(res.body.status).toBe(200)
    }, 20000)

    test('should delete the 2 notepads', async () => {
        const res1 = await request.delete(`/notepads/${createdNotepadID}`)
        expect(res1.body.status).toBe(200)
        const res2 = await request.delete(`/notepads/${secondCreatedNotepadID}`)
        expect(res2.body.status).toBe(200)
    }, 20000)

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID }).exec()
        await deleteFolderFromCloudStorage(createdNoteID, constants.nodeEnv)
        await deleteTestUsers([acceptedCredentials1.email, acceptedCredentials2.email])
        await redisConfig.close()
        await mongodbConfig.close()
    }, 30000)
})
