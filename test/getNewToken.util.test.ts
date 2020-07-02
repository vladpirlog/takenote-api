import getNewToken from '../src/utils/getNewToken.util'
import constants from '../src/config/constants'

describe('token creation testing', () => {
    test('generate reset token', () => {
        const token = getNewToken('reset')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(constants.token.resetLength)
    })

    test('generate forgot token', () => {
        const token = getNewToken('forgot')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(constants.token.forgotLength)
    })

    test('generate confirmation token', () => {
        const token = getNewToken('confirmation')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(constants.token.confirmationLength)
    })
})
