import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants.config'

describe('email RegEx testing', () => {
    const acceptedStrings = [
        'test@test.com',
        'example-_.email@email1.com',
        [
            '-_aa@test.lala',
            'bbb@aaa.bbb.lala'
        ]
    ]

    const rejectedStrings = [
        'a',
        '-_]]][',
        'example-_.email@email1_-.com',
        'jlsdfjdksfdsjgerglkjgoigj',
        ['AAZZ0-9_'],
        ['qwerty', 'uiop00000'],
        [
            'ppppp',
            'test-test@test.test.com'
        ],
        ['..', 'lala-eeligg']
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.email, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.email, s)).toBeFalsy()
    })
})
