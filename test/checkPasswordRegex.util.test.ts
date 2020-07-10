import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants.config'

describe('password RegEx testing', () => {
    const acceptedStrings = [
        'Abbccdd1!',
        ['Qwerty1!', 'Asdfgh0?']
    ]

    const rejectedStrings = [
        'lsls',
        'abcd',
        'Test1!',
        ['qwerty1!', 'Asdfgh0?'],
        ['qwerty1!', 'asdfgh0_']
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.password, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.password, s)).toBeFalsy()
    })
})
