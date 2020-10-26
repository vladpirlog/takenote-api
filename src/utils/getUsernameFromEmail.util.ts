import { IUserSchema } from '../types/User'

/**
 * Creates a valid username. Takes the first 12 characters from the part before the '@' symbol of the email
 * and appends 4 digits to avoid collisions.
 * @param email a valid email string
 */
const getUsernameFromEmail = (email: IUserSchema['email']) => {
    const firstPartOfEmail = /[^@]+/.exec(email)
    if (!firstPartOfEmail) throw new Error('Email cannot be parsed.')
    let randomAppendedDigits = ''
    for (let i = 0; i < 4; ++i) {
        randomAppendedDigits += Math.floor(Math.random() * 10).toString()
    }
    return firstPartOfEmail[0].slice(0, 12) + randomAppendedDigits
}

export default getUsernameFromEmail
