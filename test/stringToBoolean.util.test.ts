import stringToBoolean from '../src/utils/stringToBoolean.util'

describe('transform string to boolean testing', () => {
    const inputAndOutput: [string | undefined, boolean | undefined][] = [
        ['', undefined], ['true', true], ['false', false], ['0', undefined],
        ['a', undefined], ['TRUE', true], ['FALSE', false], ['tRuE', true],
        ['faLse', false], ['true,', undefined], ['.false', undefined], [undefined, undefined]
    ]

    test.each(inputAndOutput)('%j should be %j', (str, res) => {
        expect(stringToBoolean(str)).toBe(res)
    })
})
