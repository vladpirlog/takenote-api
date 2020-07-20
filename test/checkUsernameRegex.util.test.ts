import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants.config'

describe('username RegEx testing', () => {
    const acceptedStrings = [
        'salut',
        ['AAZZ0-9_'],
        ['qwerty', 'uiop00000']
    ]

    const rejectedStrings = [
        'a',
        '-_]]][',
        'jlsdfjdksfdsjgerglkjgoigj',
        ['ppppp', 'aaaaaajsgjsg ghe'],
        ['..', 'lala-eeligg']
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.username, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.username, s)).toBeFalsy()
    })
})
