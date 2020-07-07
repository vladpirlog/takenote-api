import getNewToken from '../src/utils/getNewToken.util'
import constants from '../src/config/constants.config'

describe('token creation testing', () => {
    test('generate reset token', () => {
        const token = getNewToken('reset')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(
            constants.idInfo.reset.prefix.length + constants.idInfo.reset.length
        )
        expect(token.token.substr(0, constants.idInfo.reset.prefix.length))
            .toBe(constants.idInfo.reset.prefix)
    })

    test('generate forgot token', () => {
        const token = getNewToken('forgot')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(
            constants.idInfo.forgot.prefix.length + constants.idInfo.forgot.length
        )
        expect(token.token.substr(0, constants.idInfo.forgot.prefix.length))
            .toBe(constants.idInfo.forgot.prefix)
    })

    test('generate confirmation token', () => {
        const token = getNewToken('confirmation')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.token).toBe('string')
        expect(token.token).toHaveLength(
            constants.idInfo.confirmation.prefix.length + constants.idInfo.confirmation.length
        )
        expect(token.token.substr(0, constants.idInfo.confirmation.prefix.length))
            .toBe(constants.idInfo.confirmation.prefix)
    })
})
