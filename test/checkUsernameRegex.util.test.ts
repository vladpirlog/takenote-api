import constants from '../src/config/constants.config'

describe('username RegEx testing', () => {
    const acceptedStrings = [
        'salut',
        'AAZZ0-9_',
        'qwerty',
        'uiop00000',
        'lsdgng979-_673jdsgl6',
        'lala-eeligg',
        'ppppp'
    ]

    const rejectedStrings = [
        'a',
        '',
        '-_]]][',
        'jlsdfjdksfdsjgerglkjgoigj',
        'aaaaaajsgjsg ghe',
        '..',
        'lsdgng979-_673jdsgl6r'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(constants.regex.username.test(s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(constants.regex.username.test(s)).toBeFalsy()
    })
})
