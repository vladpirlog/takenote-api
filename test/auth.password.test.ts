import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import constants from '../src/config/constants.config'
import User from '../src/models/User'
import { deleteTestUsers, generateRejectedCredentials, registerTestUser } from './testingUtils'
import { RedisClient } from '../src/config/RedisClient'

describe('test pw reset flows', () => {
    const request = supertest.agent(app)
    let acceptedCredentials
    const rejectedCredentials = generateRejectedCredentials()

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        RedisClient.connect({ host: constants.test.redis.host, port: constants.test.redis.port })
        acceptedCredentials = await registerTestUser(request)
    }, 30000)

    test('check wrong token for expiration', async () => {
        const res = await request
            .post('/auth/check_token')
            .query({ token: '123456' })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with wrong email', async () => {
        const res = await request
            .post('/auth/forgot_password')
            .send({ email: rejectedCredentials.email })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with correct email', async () => {
        const res = await request
            .post('/auth/forgot_password')
            .send({ email: acceptedCredentials.email })

        expect(res.status).toBe(200)
    }, 20000)

    test('check reset token for expiration', async () => {
        const info = await User.findOne({
            email: acceptedCredentials.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .get('/auth/check_token')
            .query({ token: info.resetToken.id })

        expect(res.status).toBe(200)
    }, 20000)

    test('submit wrong reset token', async () => {
        const res = await request
            .post('/auth/new_password')
            .send({
                new_password: acceptedCredentials.password,
                confirm_new_password: acceptedCredentials.password
            })
            .query({ token: '123456' })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('submit correct reset token #1', async () => {
        const info = await User.findOne({
            email: acceptedCredentials.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .post('/auth/new_password')
            .send({
                new_password: acceptedCredentials.password,
                confirm_new_password: acceptedCredentials.password
            })
            .query({ token: info.resetToken.id })

        expect(res.status).toBe(200)
    }, 20000)

    test('successful email-pw login', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                email: acceptedCredentials.email,
                password: acceptedCredentials.password
            })

        expect(res.status).toBe(200)
        expect(typeof res.body.user).toBe('object')
    }, 20000)

    test('request reset token with wrong old password', async () => {
        const res = await request
            .post('/auth/reset_password')
            .send({ old_password: rejectedCredentials.password })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with correct old password', async () => {
        const res = await request
            .post('/auth/reset_password')
            .send({ old_password: acceptedCredentials.password })

        expect(res.status).toBe(200)
    }, 20000)

    test('check reset token for expiration', async () => {
        const info = await User.findOne({
            email: acceptedCredentials.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .get('/auth/check_token')
            .query({ token: info.resetToken.id })
        expect(res.status).toBe(200)
    }, 20000)

    test('submit correct reset token #2', async () => {
        const info = await User.findOne({
            email: acceptedCredentials.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .post('/auth/new_password')
            .send({
                new_password: acceptedCredentials.password,
                confirm_new_password: acceptedCredentials.password
            })
            .query({ token: info.resetToken.id })
        expect(res.status).toBe(200)
    }, 20000)

    afterAll(async () => {
        await deleteTestUsers([acceptedCredentials.email])
        await mongodbConfig.close()
        await RedisClient.quit()
    }, 30000)
})
