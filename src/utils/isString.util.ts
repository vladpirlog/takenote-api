/**
 * Checks if the given argument is a string.
 * @param val object to be checked
 */
const isString = (val: any) => {
    return typeof val === 'string' || val instanceof String
}

export default isString
