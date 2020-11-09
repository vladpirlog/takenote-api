import { nanoid } from 'nanoid'
import supertest from 'supertest'
import State from '../src/enums/State.enum'
import User from '../src/models/User'

export const generateValidCredentials = () => {
    const username = nanoid(12)
    const email = `${username}@example.com`
    const password = 'Qwerty1!'

    return { username, email, password }
}

export const generateRejectedCredentials = () => {
    const username = nanoid(12) + '~@~'
    const email = `${username}@example.com`
    const password = 'abc'

    return { username, email, password }
}

export const registerTestUser = async (request: supertest.SuperAgentTest) => {
    const credentials = generateValidCredentials()
    await request
        .post('/auth/register')
        .send({
            email: credentials.email,
            username: credentials.username,
            password: credentials.password,
            confirm_password: credentials.password
        })
    await User.findOneAndUpdate(
        { email: credentials.email },
        { $unset: { confirmationToken: '' }, state: State.ACTIVE }
    ).exec()
    return credentials
}

export const deleteTestUsers = (emails: string[]) => {
    return Promise.all(emails.map(e => User.findOneAndDelete({ email: e }).exec()))
}
