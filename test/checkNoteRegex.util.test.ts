import checkRegex from '../src/utils/checkRegex.util'
import constants from '../src/config/constants.config'
import https from 'https'

describe('testing note title regex', () => {
    const acceptedStrings = [
        'snbgrnrenbljboebeo',
        '',
        'aa',
        '123456',
        '[];!@#$%^&*]\'",./<>?\\|',
        'I:@[k=|5V]R0UwTMpx4#r<^9^1d.Cr^l+?[S(^im9e!V^eZkYXl&<frx1toTX#X&)[)}[nVCYja4\'NvAQTp{1IeH%QVC#_6D8l}I'
    ]

    const rejectedStrings = [
        'rH?AU<o3dvk/d$vPir#Su;-,h8]EC-Q-aN/)E&C.U8_O&Zo^}S-Bg\'8o|rfUJWm90[|D%O-UHS&8V\nxC4y}XI.<A!w=wy,GE9M!y',
        '😀',
        '¡',
        'Ê',
        '␡␡',
        '̥',
        '\n',
        '\t',
        '\f',
        '\r',
        '\v',
        '\b'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.note.title, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.note.title, s)).toBeFalsy()
    })
})

describe('testing note content regex', () => {
    const acceptedStrings = [
        'snbgrnrenbljboebeo',
        '',
        'aa',
        '123456',
        '[];!@#$%^&*]\'",./<>?\\|',
        'aa\naa',
        'aa\taa',
        '\n',
        '\t',
        '\f',
        '\r',
        '\v'
    ]

    const rejectedStrings = [
        '😀',
        '¡',
        'Ê',
        '␡␡',
        '̥',
        '\b'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.note.content, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.note.content, s)).toBeFalsy()
    })

    test('length requirement (max 10000 chars)', (done) => {
        https.get('https://helloacm.com/api/random/?n=10000&x=15', res => {
            let body = ''
            res.on('data', (data) => { body += data })
            res.on('error', (error) => done(error))
            res.on('end', () => {
                const longString = JSON.parse(body)
                expect(checkRegex(constants.regex.note.content, longString)).toBeTruthy()
                expect(checkRegex(constants.regex.note.content, longString + ' ')).toBeFalsy()
                return done()
            })
        })
    })
})

describe('testing note color regex', () => {
    const acceptedStrings = [
        '#000000',
        '#ffffff',
        '#aBcDeF',
        '#AAAAAA',
        '#e3fAb8'
    ]

    const rejectedStrings = [
        '😀',
        '#00000',
        '#0000000',
        'ffffff',
        '$123',
        '',
        '#aBcDeG'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.note.color, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.note.color, s)).toBeFalsy()
    })
})

describe('testing attachment title regex', () => {
    const acceptedStrings = [
        'snbgrnrenbljboebeo',
        '',
        'aa',
        '123456',
        '[];!@#$%^&*]\'",./<>?\\|',
        'jAyskJOJNzCoMudpPljwnaDLRFXPNJUs'
    ]

    const rejectedStrings = [
        '😀',
        '¡',
        'Ê',
        '␡␡',
        '̥',
        'uEetEyDxncysPAZxHAFsqDbWCzAlCitsm',
        '\n',
        '\t',
        '\f',
        '\r',
        '\v',
        '\b'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.attachment.title, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.attachment.title, s)).toBeFalsy()
    })
})

describe('testing attachment description regex', () => {
    const acceptedStrings = [
        'snbgrnrenbljboebeo',
        '',
        'aa',
        '123456',
        '[];!@#$%^&*]\'",./<>?\\|'
    ]

    const rejectedStrings = [
        '😀',
        '¡',
        'Ê',
        '␡␡',
        '̥',
        '\n',
        '\t',
        '\f',
        '\r',
        '\v',
        '\b'
    ]

    test.each(acceptedStrings)('%j should return true', (s) => {
        expect(checkRegex(constants.regex.attachment.description, s)).toBeTruthy()
    })

    test.each(rejectedStrings)('%j should return false', (s) => {
        expect(checkRegex(constants.regex.attachment.description, s)).toBeFalsy()
    })

    test('length requirement (max 256 chars)', (done) => {
        https.get('https://helloacm.com/api/random/?n=256&x=15', res => {
            let body = ''
            res.on('data', (data) => { body += data })
            res.on('error', (error) => done(error))
            res.on('end', () => {
                const longString = JSON.parse(body)
                expect(checkRegex(constants.regex.attachment.description, longString)).toBeTruthy()
                expect(checkRegex(constants.regex.attachment.description, longString + ' ')).toBeFalsy()
                return done()
            })
        })
    })
})
