import supertest from 'supertest'
import app from '../src/app'
import constants from '../src/config/constants.config'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import { Role } from '../src/enums/Role.enum'
import Note from '../src/models/Note'
import { getRolesOfNote } from '../src/queries/getRoles.query'
import { INoteSchema } from '../src/types/Note'
import { IUserSchema } from '../src/types/User'
import { deleteFolderFromCloudStorage } from '../src/utils/cloudFileStorage.util'
import { deleteTestUsers, registerTestUser } from './testingUtils'

describe('test note role queries', () => {
    const request = supertest.agent(app)
    let acceptedCredentials1
    let acceptedCredentials2
    let userID: IUserSchema['id']
    let createdNoteID: INoteSchema['id']

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()

        acceptedCredentials1 = await registerTestUser(request)
        acceptedCredentials2 = await registerTestUser(request)

        const res1 = await request.post('/auth/login').send({
            email: acceptedCredentials1.email,
            password: acceptedCredentials1.password
        })
        userID = res1.body.user.id

        const res2 = await request.post('/notes')
        createdNoteID = res2.body.note.id
    }, 30000)

    test('owner should have note_owner role', async () => {
        const noteRoles = Array.from(await getRolesOfNote(userID, createdNoteID))
        expect(noteRoles).toEqual([Role.OWNER])
    }, 20000)

    test.each([Role.OBSERVER, Role.SECONDARY_COLLABORATOR, Role.PRIMARY_COLLABORATOR])(
        'collaborator should have %s role',
        async (role) => {
            const res = await request
                .post(`/notes/${createdNoteID}/share/collaborators`)
                .send({
                    user: acceptedCredentials2.username,
                    type: role
                })
            const noteRoles = Array.from(await getRolesOfNote(res.body.collaborator.subject.id, createdNoteID))
            expect(noteRoles).toEqual([role])
        }, 20000
    )

    afterAll(async () => {
        await Note.findOneAndDelete({ id: createdNoteID }).exec()
        await deleteFolderFromCloudStorage(createdNoteID, constants.nodeEnv)
        await deleteTestUsers([acceptedCredentials1.email, acceptedCredentials2.email])
        await mongodbConfig.close()
        await redisConfig.close()
    }, 20000)
})
