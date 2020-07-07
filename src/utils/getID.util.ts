import { nanoid } from 'nanoid'
import constants from '../config/constants.config'

/**
 * Returns an id with a prefix and a random sequence of alphanumeric characters.
 * @param type the type of id to be created
 */
const getID = (type: 'note' | 'user' | 'jwt' | 'share' | 'reset' | 'forgot' | 'confirmation') => {
    return constants.idInfo[type].prefix + nanoid(constants.idInfo[type].length)
}

export default getID
