import getUnixTime from './getUnixTime.util'
import constants from '../config/constants.config'
import Token from '../models/Token'
import createID from './createID.util'

/**
 * Creates a new token object of a certain type. Returns an ITokenSchema object having id and exp properties.
 * @param type the type of token to be generated
 */
const createNewToken = (type: 'reset' | 'confirmation') => {
    return new Token({
        id: createID(type),
        exp: Math.floor(getUnixTime() + constants.token.expires / 1000)
    })
}

export default createNewToken
