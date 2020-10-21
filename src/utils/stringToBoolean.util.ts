/**
 * Converts a string to a boolean. Anything other than 'true' or 'false' returns undefined.
 * @param str string to be converted to boolean
 */
const stringToBoolean = (str?: string): boolean | undefined => {
    if (!str) return undefined
    return str.toLowerCase() === 'true'
        ? true : str.toLowerCase() === 'false'
            ? false : undefined
}

export default stringToBoolean
