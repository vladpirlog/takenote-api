import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import constants from '../src/config/constants.config'
import User from '../src/models/User'
import { deleteTestUsers, generateRejectedCredentials, generateValidCredentials } from './testingUtils'

describe('test registration and authentication flows', () => {
    const request = supertest.agent(app)
    const acceptedCredentials = generateValidCredentials()
    const rejectedCredentials = generateRejectedCredentials()

    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
    }, 30000)

    test('server status', async () => {
        const res = await request.get('/')
        expect(res.status).toBe(200)
        expect(typeof res.body).toBe('object')
        expect(res.body.status).toBe(200)
        expect(typeof res.body.message).toBe('string')
    }, 20000)

    test('get authenticated user when NOT logged in', async () => {
        const res = await request.get('/auth/me')
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('logout when user is NOT authenticated', async () => {
        const res = await request.post('/auth/logout')
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('rejected registration', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                email: rejectedCredentials.email,
                password: rejectedCredentials.password,
                confirm_password: rejectedCredentials.password
            })
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('successful registration', async () => {
        const res = await request
            .post('/auth/register')
            .send({
                email: acceptedCredentials.email,
                password: acceptedCredentials.password,
                confirm_password: acceptedCredentials.password
            })
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('user')
        expect(res.body.user.email).toBe(acceptedCredentials.email)
        expect(res.body.user).toHaveProperty('id')
        expect(res.body.user).toHaveProperty('state')
        expect(res.body.user).toHaveProperty('twoFactorAuth')
        expect(res.body.user.isOAuthUser).toBeFalsy()
    }, 20000)

    test('request another confirmation token when not logged in', async () => {
        const res = await request
            .post('/auth/request_confirmation')
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('rejected login', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                email: rejectedCredentials.email,
                password: rejectedCredentials.password
            })
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('successful email-pw login', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                email: acceptedCredentials.email,
                password: acceptedCredentials.password
            })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('user')
        expect(res.body.user.email).toBe(acceptedCredentials.email)
        expect(res.body.user).toHaveProperty('id')
        expect(res.body.user).toHaveProperty('state')
        expect(res.body.user).toHaveProperty('twoFactorAuth')
        expect(res.body.user.isOAuthUser).toBeFalsy()
    }, 20000)

    test('request another confirmation token when logged in', async () => {
        const res = await request
            .post('/auth/request_confirmation')
        expect(res.status).toBe(200)
    }, 20000)

    test('confirm account', async () => {
        const info = await User.findOne({
            email: acceptedCredentials.email
        }).select('confirmationToken').exec()
        const res = await request
            .post('/auth/confirm')
            .query({ token: info.confirmationToken.id })
        expect(res.status).toBe(200)
    }, 20000)

    test('get authenticated user when logged in', async () => {
        const res = await request.get('/auth/me')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('user')
        expect(res.body.user.email).toBe(acceptedCredentials.email)
        expect(res.body.user).toHaveProperty('id')
        expect(res.body.user).toHaveProperty('state')
        expect(res.body.user).toHaveProperty('twoFactorAuth')
        expect(res.body.user.isOAuthUser).toBeFalsy()
    }, 20000)

    test('restore account when not deleted', async () => {
        const res = await request.post('/auth/recover')
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request account deletion with wrong pw', async () => {
        const res = await request
            .post('/auth/delete')
            .send({ old_password: rejectedCredentials.password })
        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request account deletion with correct pw', async () => {
        const res = await request
            .post('/auth/delete')
            .send({ old_password: acceptedCredentials.password })
        expect(res.status).toBe(200)
    }, 20000)

    test('restore account when deleted', async () => {
        const res = await request.post('/auth/recover')
        expect(res.status).toBe(200)
    }, 20000)

    test('logout when user is authenticated', async () => {
        const res = await request.post('/auth/logout')
        expect(res.status).toBe(200)
    }, 20000)

    afterAll(async () => {
        await deleteTestUsers([acceptedCredentials.email])
        await mongodbConfig.close()
        await redisConfig.close()
    }, 30000)
})
