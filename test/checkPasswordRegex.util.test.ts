import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants'

describe('password RegEx testing', () => {
    test('should return true', () => {
        expect(checkRegex(constants.regex.password, 'lsls')).toBeFalsy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.password, 'abcd')).toBeFalsy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.password, 'Abbccdd1!')).toBeTruthy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.password, 'Test1!')).toBeFalsy()
    })

    test('should return true', () => {
        expect(
            checkRegex(constants.regex.password, ['Qwerty1!', 'Asdfgh0?'])
        ).toBeTruthy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.password, ['qwerty1!', 'Asdfgh0?'])
        ).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.password, ['qwerty1!', 'asdfgh0_'])
        ).toBeFalsy()
    })
})
