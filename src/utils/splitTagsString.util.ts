import constants from '../config/constants.config'
import checkRegex from './checkRegex.util'

/**
 * Splits and tests a tags string. Returns an array of tags.
 * @param str string to parse
 */
const splitTagsString = (str: string): string[] | null => {
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
