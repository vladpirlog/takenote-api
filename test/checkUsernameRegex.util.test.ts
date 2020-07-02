import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants'

describe('username RegEx testing', () => {
    test('should return true', () => {
        expect(checkRegex(constants.regex.username, 'salut')).toBeTruthy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.username, 'a')).toBeFalsy()
    })

    test('should return false', () => {
        expect(checkRegex(constants.regex.username, '-_]]][')).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.username, 'jlsdfjdksfdsjgerglkjgoigj')
        ).toBeFalsy()
    })

    test('should return true', () => {
        expect(checkRegex(constants.regex.username, ['AAZZ0-9_'])).toBeTruthy()
    })

    test('should return true', () => {
        expect(
            checkRegex(constants.regex.username, ['qwerty', 'uiop00000'])
        ).toBeTruthy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.username, ['ppppp', 'aaaaaajsgjsg ghe'])
        ).toBeFalsy()
    })

    test('should return false', () => {
        expect(
            checkRegex(constants.regex.username, ['..', 'lala-eeligg'])
        ).toBeFalsy()
    })
})
