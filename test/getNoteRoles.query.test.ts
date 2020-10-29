import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import getNoteRoles from '../src/queries/getNoteRoles.query'
import { INoteSchema } from '../src/types/Note'
import { IUserSchema } from '../src/types/User'
import { NoteRole } from '../src/utils/accessManagement.util'

describe('test note role queries', () => {
    const request = supertest.agent(app)
    let userID: IUserSchema['id']
    let createdNoteID: INoteSchema['id']

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
        const res1 = await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser2.email,
                password: constants.test.persistentUser2.password
            })
        userID = res1.body.user.id
        const res2 = await request.post('/notes')
        createdNoteID = res2.body.note.id
    }, 20000)

    test('owner should have %s role', async () => {
        const noteRoles = await getNoteRoles(createdNoteID, userID)
        expect(noteRoles).toEqual([NoteRole.OWNER])
    })

    test.each([NoteRole.OBSERVER, NoteRole.SECONDARY_COLLABORATOR, NoteRole.PRIMARY_COLLABORATOR])(
        'collaborator should have %s role',
        async (role) => {
            const res = await request
                .post(`/notes/${createdNoteID}/share/collaborators`)
                .send({
                    user: constants.test.persistentUser.username,
                    type: role
                })
            const noteRoles = await getNoteRoles(createdNoteID, res.body.collaborator.subject.id)
            expect(noteRoles).toEqual([role])
        }
    )

    afterAll(async () => {
        await request.delete(`/notes/${createdNoteID}`)
        await mongodbConfig.close()
        await redisConfig.close()
    }, 20000)
})
