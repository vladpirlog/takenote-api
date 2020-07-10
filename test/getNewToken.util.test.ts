import createNewToken from '../src/utils/createNewToken.util'
import constants from '../src/config/constants.config'

describe('token creation testing', () => {
    test('generate reset token', () => {
        const token = createNewToken('reset')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.id).toBe('string')
        expect(token.id).toHaveLength(
            constants.idInfo.reset.prefix.length + constants.idInfo.reset.length
        )
        expect(token.id.substr(0, constants.idInfo.reset.prefix.length))
            .toBe(constants.idInfo.reset.prefix)
    })

    test('generate forgot token', () => {
        const token = createNewToken('forgot')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.id).toBe('string')
        expect(token.id).toHaveLength(
            constants.idInfo.forgot.prefix.length + constants.idInfo.forgot.length
        )
        expect(token.id.substr(0, constants.idInfo.forgot.prefix.length))
            .toBe(constants.idInfo.forgot.prefix)
    })

    test('generate confirmation token', () => {
        const token = createNewToken('confirmation')
        expect(typeof token.exp).toBe('number')
        expect(token.exp.toString()).toHaveLength(10)

        expect(typeof token.id).toBe('string')
        expect(token.id).toHaveLength(
            constants.idInfo.confirmation.prefix.length + constants.idInfo.confirmation.length
        )
        expect(token.id.substr(0, constants.idInfo.confirmation.prefix.length))
            .toBe(constants.idInfo.confirmation.prefix)
    })
})
