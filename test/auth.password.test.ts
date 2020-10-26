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

    test('check wrong token for expiration', (done) => {
        request
            .post('/auth/check_token')
            .query({ token: '123456' })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('request reset token with wrong email', (done) => {
        request
            .post('/auth/forgot_password')
            .send({ email: constants.test.wrongCredentials.email })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('request reset token with correct email', (done) => {
        request
            .post('/auth/forgot_password')
            .send({ email: constants.test.persistentUser.email })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('check reset token for expiration', async (done) => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        request
            .get('/auth/check_token')
            .query({ token: info.resetToken.id })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('submit wrong reset token', (done) => {
        request
            .post('/auth/new_password')
            .send({
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: '123456' })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('submit correct reset token #1', async (done) => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        request
            .post('/auth/new_password')
            .send({
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: info.resetToken.id })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('successful username-pw login', (done) => {
        request
            .post('/auth/login')
            .send({
                email: constants.test.persistentUser.username,
                password: constants.test.persistentUser.password
            })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(typeof res.body.user).toBe('object')
                return done()
            })
    }, 20000)

    test('request reset token with wrong old password', (done) => {
        request
            .post('/auth/reset_password')
            .send({ old_password: constants.test.wrongCredentials.password })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('request reset token with correct old password', (done) => {
        request
            .post('/auth/reset_password')
            .send({ old_password: constants.test.persistentUser.password })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('check reset token for expiration', async (done) => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        request
            .get('/auth/check_token')
            .query({ token: info.resetToken.id })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('submit correct reset token #2', async (done) => {
        const info = await User.findOne({
            email: constants.test.persistentUser.email
        })
            .select('resetToken')
            .exec()
        request
            .post('/auth/new_password')
            .send({
                new_password: constants.test.persistentUser.password,
                confirm_new_password: constants.test.persistentUser.password
            })
            .query({ token: info.resetToken.id })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    afterAll(async () => {
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
