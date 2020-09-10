import stringToBoolean from '../src/utils/stringToBoolean.util'

describe('transform string to boolean testing', () => {
    const inputAndOutput: [string | undefined, boolean | null][] = [
        ['', null], ['true', true], ['false', false], ['0', null],
        ['a', null], ['TRUE', true], ['FALSE', false], ['tRuE', true],
        ['faLse', false], ['true,', null], ['.false', null], [undefined, null]
    ]

    test.each(inputAndOutput)('%j should be %j', (str, res) => {
        expect(stringToBoolean(str)).toBe(res)
    })
})
