/**
 * Splits a string by commas. Returns an array of lowercase strings.
 * @param str string to parse
 */
export default function parseStringToArray (str: string): string[] {
    return str.toLowerCase().split(',')
}
