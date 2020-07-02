import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants'

describe('email RegEx testing', () => {
    test('should return true', () => {
        expect(checkRegex(constants.regex.email, 'test@test.com')).toBeTruthy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.email, 'a')).toBeFalsy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.email, '-_]]][')).toBeFalsy()
    })

    test('should return true', () => {
        expect(
            checkRegex(constants.regex.email, 'example-_.email@email1.com')
        ).toBeTruthy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.email, 'example-_.email@email1_-.com')
        ).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.email, 'jlsdfjdksfdsjgerglkjgoigj')
        ).toBeFalsy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.email, ['AAZZ0-9_'])).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.email, ['qwerty', 'uiop00000'])
        ).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.email, [
                'ppppp',
                'test-test@test.test.com'
            ])
        ).toBeFalsy()
    })

    test('should return true', () => {
        expect(
            checkRegex(constants.regex.email, [
                '-_aa@test.lala',
                'bbb@aaa.bbb.lala'
            ])
        ).toBeTruthy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.email, ['..', 'lala-eeligg'])
        ).toBeFalsy()
    })
})
