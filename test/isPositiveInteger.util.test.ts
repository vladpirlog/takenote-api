import isPositiveInteger from '../src/utils/isPositiveInteger.util'

describe('string is positive number testing', () => {
    const inputAndOutput: [string | undefined, boolean][] = [
        ['', false], ['1', true], ['2456', true], ['1.01', false],
        ['-3', false], ['0', true], [undefined, false], ['-3.48', false],
        ['99999999999999999', false], ['-99999999999999999', false], ['0.000000001', false]
    ]

    test.each(inputAndOutput)('%j should be %j', (str, res) => {
        expect(isPositiveInteger(str)).toBe(res)
    })
})
