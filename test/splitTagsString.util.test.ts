import splitTagsString from '../src/utils/splitTagsString.util'

describe('string parsing testing', () => {
    const stringsAndArrays: [string, string[]][] = [
        ['t1,t2,t3', ['t1', 't2', 't3']],
        ['t1..,t2..,.!.t3', ['t1..', 't2..', '.!.t3']],
        ['t1,,t2,t3', ['t1', '', 't2', 't3']],
        ['t1,,t2,,.,,t3', ['t1', '', 't2', '', '.', '', 't3']],
        [',,', ['', '', '']]
    ]

    test.each(stringsAndArrays)('%j should equal %j', (s, arr) => {
        expect(splitTagsString(s)).toEqual(arr)
    })
})
