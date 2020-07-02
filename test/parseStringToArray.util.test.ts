import parseStringToArray from '../src/utils/parseStringToArray.util'

describe('string parsing testing', () => {
    test('normal string', () => {
        expect(parseStringToArray('t1,t2,t3')).toEqual(['t1', 't2', 't3'])
    })

    test('string with other puctuation', () => {
        expect(parseStringToArray('t1..,t2..,.!.t3')).toEqual([
            't1..',
            't2..',
            '.!.t3'
        ])
    })

    test('string with consecutive commas', () => {
        expect(parseStringToArray('t1,,t2,t3')).toEqual(['t1', '', 't2', 't3'])
    })

    test('array with consecutive commas and periods', () => {
        expect(parseStringToArray('t1,,t2,,.,,t3')).toEqual([
            't1',
            '',
            't2',
            '',
            '.',
            '',
            't3'
        ])
    })

    test('array with only consecutive commas', () => {
        expect(parseStringToArray(',,')).toEqual(['', '', ''])
    })
})
