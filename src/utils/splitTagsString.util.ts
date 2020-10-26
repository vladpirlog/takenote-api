import constants from '../config/constants.config'

/**
 * Splits and tests a tags string. Returns null or an array of tags.
 * @param str string to parse
 */
const splitTagsString = (str: string): string[] | null => {
    const tagsArray = str.toLowerCase().split(',')
    if (
        tagsArray.includes('') ||
        tagsArray.length === 0 ||
        !Array.isArray(tagsArray) ||
        tagsArray.map(elem => constants.regex.tag.test(elem)).includes(false)
    ) {
        return null
    }
    return tagsArray
}

export default splitTagsString
