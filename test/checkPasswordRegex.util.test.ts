import constants from '../src/config/constants.config'

describe('password RegEx testing', () => {
    const acceptedStrings = [
        'Abbccdd1!',
        'Qwerty1!',
        '9KsQ@G38',
        '*R$3jzZ@4O8%1HtV',
        '*cDsAsKpHX1ytk714NAgaV2da3UEn$RP@e8$ZjrD'
    ]

    const rejectedStrings = [
        '',
        'lsls',
        'abcd',
        'Test1!',
        'qwerty1!',
        'qwerty1!-',
        'asdfgh0_',
        '*cDsAsKpHX1ytk714NAgaV2da3UEn$RP@e8$ZjrDD'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(constants.regex.password.test(s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(constants.regex.password.test(s)).toBeFalsy()
    })
})
