/**
 * Tests string(s) for complete matching against a given regular expression.
 * Returns true if all the items pass the test.
 * @param regex a RegExp object
 * @param items a string or array of strings that need to be tested
 */
const checkRegex = (regex: RegExp, items: string | string[]) => {
    if (Array.isArray(items)) {
        return !items.map(elem => regex.test(elem)).includes(false)
    } else return regex.test(items)
}

export default checkRegex
