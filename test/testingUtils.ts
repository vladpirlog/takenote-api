import { nanoid } from 'nanoid'
import supertest from 'supertest'
import State from '../src/enums/State.enum'
import User from '../src/models/User'

export const generateValidCredentials = () => {
    const email = `${nanoid(12)}@example.com`
    const password = `${nanoid(10)}aA1!`

    return { email, password }
}

export const generateRejectedCredentials = () => {
    const email = `${nanoid(12) + '~@~'}@example.com`
    const password = 'abc'

    return { email, password }
}

export const registerTestUser = async (request: supertest.SuperAgentTest) => {
    const credentials = generateValidCredentials()
    await request
        .post('/auth/register')
        .send({
            email: credentials.email,
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
