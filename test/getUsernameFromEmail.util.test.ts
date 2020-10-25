import getUsernameFromEmail from '../src/utils/getUsernameFromEmail.util'

describe('email to username testing', () => {
    const inputAndOutput: [string, string][] = [
        ['test@test.com', 'test'],
        ['yahoo_12-34@yahoo.com', 'yahoo_12-34'],
        ['yahoo.yahoo@yahoo.com', 'yahoo.yahoo'],
        ['a@a.a', 'a'],
        ['a.b.c@ab.com', 'a.b.c']
    ]

    test.each(inputAndOutput)('%j should be %j', (input, output) => {
        const ans = getUsernameFromEmail(input)
        expect(ans).toMatch(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]{1,12}[0-9]{4}$/)
        expect(ans.slice(0, ans.length - 4)).toBe(output)
    })
})
