import { nanoid } from 'nanoid'
import constants from '../config/constants.config'

type CreateIDArg = 'note' | 'attachment' | 'user' | 'jwt'
| 'share' | 'reset' | 'confirmation' | 'tfa' | 'comment'

/**
 * Returns an id with a prefix and a random sequence of alphanumeric characters.
 * @param type the type of id to be created
 */
const createID = (type: CreateIDArg) => {
    return constants.idInfo[type].prefix + nanoid(constants.idInfo[type].length)
}

export default createID
