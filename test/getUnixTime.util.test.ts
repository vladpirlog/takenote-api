import getUnixTime from '../src/utils/getUnixTime.util'

describe('unix time testing', () => {
    const inputAndOutput: [Date | undefined, number][] = [
        [new Date(), Math.floor(new Date().getTime() / 1000)],
        [new Date('October 21, 2020 23:13:28'), 1603311208],
        [new Date('2020-10-21T20:13:28+00:00'), 1603311208],
        [new Date(2020, 9, 21, 23, 13, 28), 1603311208]
    ]

    test.each(inputAndOutput)('%j should be %j', (input, output) => {
        expect(getUnixTime(input)).toBe(output)
    })

    test('current timestamp with a 5 seconds delta', () => {
        expect(Math.abs(getUnixTime() - Math.floor(new Date().getTime() / 1000))).toBeLessThanOrEqual(5)
    })
})
