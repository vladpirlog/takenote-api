import { INoteSchema } from '../models/Note'
import constants from '../config/constants.config'
import checkRegex from './checkRegex.util'

/**
 * Splits a string by commas. Returns an array of lowercase strings.
 * @param str string to parse
 */
const splitTagsString = (str: string): INoteSchema['tags'] | null => {
    const tagsArray = str.toLowerCase().split(',')
    if (
        tagsArray.includes('') ||
        tagsArray.length === 0 ||
        !Array.isArray(tagsArray) ||
        !checkRegex(constants.regex.tag, tagsArray)
    ) {
        return null
    }
    return tagsArray
}

export default splitTagsString
