import supertest from 'supertest'
import app from '../src/app'
import mongodbConfig from '../src/config/mongodb.config'
import redisConfig from '../src/config/redis.config'
import constants from '../src/config/constants.config'
import User from '../src/models/User'

describe('test registration and authentication flows', () => {
    const request = supertest.agent(app)
    beforeAll(async () => {
        await mongodbConfig.connect(constants.test.mongodbURI)
        await redisConfig.connect()
    })

    test('server status', (done) => {
        request.get('/').then((res) => {
            expect(res.status).toBe(200)
            expect(typeof res.body).toBe('object')
            expect(res.body.status).toBe(200)
            expect(typeof res.body.message).toBe('string')
            return done()
        })
    }, 20000)

    test('get authenticated user when NOT logged in', (done) => {
        request.get('/auth/me').then((res) => {
            expect(res.status).toBeGreaterThanOrEqual(400)
            return done()
        })
    }, 20000)

    test('logout when user is NOT authenticated', (done) => {
        request.post('/auth/logout').then((res) => {
            expect(res.status).toBeGreaterThanOrEqual(400)
            return done()
        })
    }, 20000)

    test('rejected registration', (done) => {
        request
            .post('/auth/register')
            .send({
                email: constants.test.wrongCredentials.email,
                username: constants.test.wrongCredentials.username,
                password: constants.test.wrongCredentials.password,
                confirm_password: constants.test.wrongCredentials.password
            })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('successful registration', (done) => {
        request
            .post('/auth/register')
            .send({
                email: constants.test.acceptedCredentials.email,
                username: constants.test.acceptedCredentials.username,
                password: constants.test.acceptedCredentials.password,
                confirm_password: constants.test.acceptedCredentials.password
            })
            .then((res) => {
                expect(res.status).toBe(201)
                expect(res.body).toHaveProperty('user')
                expect(res.body.user.username).toBe(constants.test.acceptedCredentials.username)
                expect(res.body.user.email).toBe(constants.test.acceptedCredentials.email)
                expect(res.body.user).toHaveProperty('_id')
                expect(res.body.user).toHaveProperty('twoFactorAuth')
                expect(res.body.user.isOAuthUser).toBeFalsy()
                return done()
            })
    }, 20000)

    test('request another confirmation token when not logged in', async (done) => {
        request
            .post('/auth/request_confirmation')
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('rejected login', (done) => {
        request
            .post('/auth/login')
            .send({
                email: constants.test.wrongCredentials.username,
                password: constants.test.wrongCredentials.password
            })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('successful username-pw login', (done) => {
        request
            .post('/auth/login')
            .send({
                email: constants.test.acceptedCredentials.username,
                password: constants.test.acceptedCredentials.password
            })
            .then((res) => {
                expect(res.status).toBe(200)
                expect(res.body).toHaveProperty('user')
                expect(res.body.user.email).toBe(constants.test.acceptedCredentials.email)
                expect(res.body.user.username).toBe(constants.test.acceptedCredentials.username)
                expect(res.body.user).toHaveProperty('_id')
                expect(res.body.user).toHaveProperty('twoFactorAuth')
                expect(res.body.user.isOAuthUser).toBeFalsy()
                return done()
            })
    }, 20000)

    test('request another confirmation token when logged in', async (done) => {
        request
            .post('/auth/request_confirmation')
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('confirm account', async (done) => {
        const info = await User.findOne({
            email: constants.test.acceptedCredentials.email
        })
            .select('confirmationToken')
            .exec()
        request
            .post('/auth/confirm')
            .query({ token: info.confirmationToken.id })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('get authenticated user when logged in', (done) => {
        request.get('/auth/me').then((res) => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('user')
            expect(res.body.user.email).toBe(constants.test.acceptedCredentials.email)
            expect(res.body.user.username).toBe(constants.test.acceptedCredentials.username)
            expect(res.body.user).toHaveProperty('_id')
            expect(res.body.user).toHaveProperty('twoFactorAuth')
            expect(res.body.user.isOAuthUser).toBeFalsy()
            return done()
        })
    }, 20000)

    test('restore account when not deleted', (done) => {
        request.post('/auth/recover').then((res) => {
            expect(res.status).toBeGreaterThanOrEqual(400)
            return done()
        })
    }, 20000)

    test('request account deletion with wrong pw', (done) => {
        request
            .post('/auth/delete')
            .send({ old_password: constants.test.wrongCredentials.password })
            .then((res) => {
                expect(res.status).toBeGreaterThanOrEqual(400)
                return done()
            })
    }, 20000)

    test('request account deletion with correct pw', (done) => {
        request
            .post('/auth/delete')
            .send({ old_password: constants.test.acceptedCredentials.password })
            .then((res) => {
                expect(res.status).toBe(200)
                return done()
            })
    }, 20000)

    test('restore account when deleted', (done) => {
        request.post('/auth/recover').then((res) => {
            expect(res.status).toBe(200)
            return done()
        })
    }, 20000)

    test('logout when user is authenticated', (done) => {
        request.post('/auth/logout').then((res) => {
            expect(res.status).toBe(200)
            return done()
        })
    }, 20000)

    afterAll(async () => {
        await User.findOneAndDelete({
            email: constants.test.acceptedCredentials.email
        }).exec()
        await mongodbConfig.close()
        await redisConfig.close()
    })
})
