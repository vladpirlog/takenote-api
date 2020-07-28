import { INoteSchema } from '../models/Note'

/**
 * Splits a string by commas. Returns an array of lowercase strings.
 * @param str string to parse
 */
const parseStringToArray = (str: string): INoteSchema['tags'] => {
    return str.toLowerCase().split(',')
}

export default parseStringToArray
