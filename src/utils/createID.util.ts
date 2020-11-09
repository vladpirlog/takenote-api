import { nanoid } from 'nanoid'
import constants from '../config/constants.config'

/**
 * Returns an id with a prefix and a random sequence of alphanumeric characters.
 * @param type the type of id to be created
 */
const createID = (type: keyof typeof constants.idInfo) => {
    return constants.idInfo[type].prefix + nanoid(constants.idInfo[type].length)
}

export default createID
