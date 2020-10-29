import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import constants from '../src/config/constants.config'
import User from '../src/models/User'

describe('test pw reset flows', () => {
    const request = supertest.agent(app)
    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        redisConfig.connect()
    })

    test('check wrong token for expiration', async () => {
        const res = await request
            .post('/auth/check_token')
            .query({ token: '123456' })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with wrong email', async () => {
        const res = await request
            .post('/auth/forgot_password')
            .send({ email: constants.test.wrongCredentials.email })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with correct email', async () => {
        const res = await request
            .post('/auth/forgot_password')
            .send({ email: constants.test.persistentUser.email })

        expect(res.status).toBe(200)
    }, 20000)

    test('check reset token for expiration', async () => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
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
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: '123456' })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('submit correct reset token #1', async () => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .post('/auth/new_password')
            .send({
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: info.resetToken.id })

        expect(res.status).toBe(200)
    }, 20000)

    test('successful username-pw login', async () => {
        const res = await request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.username,
                password: constants.test.persistentUser.password
            })

        expect(res.status).toBe(200)
        expect(typeof res.body.user).toBe('object')
    }, 20000)

    test('request reset token with wrong old password', async () => {
        const res = await request
            .post('/auth/reset_password')
            .send({ old_password: constants.test.wrongCredentials.password })

        expect(res.status).toBeGreaterThanOrEqual(400)
    }, 20000)

    test('request reset token with correct old password', async () => {
        const res = await request
            .post('/auth/reset_password')
            .send({ old_password: constants.test.persistentUser.password })

        expect(res.status).toBe(200)
    }, 20000)

    test('check reset token for expiration', async () => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
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
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        const res = await request
            .post('/auth/new_password')
            .send({
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: info.resetToken.id })
        expect(res.status).toBe(200)
    }, 20000)

    afterAll(async () => {
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
