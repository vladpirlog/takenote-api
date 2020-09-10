/**
 * Converts a string to a boolean. Anything other than 'true' or 'false' returns null.
 * @param str string to be converted to boolean
 */
const stringToBoolean = (str?: string): boolean | null => {
    if (!str) return null
    return str.toLowerCase() === 'true'
        ? true : str.toLowerCase() === 'false'
            ? false : null
}

export default stringToBoolean
