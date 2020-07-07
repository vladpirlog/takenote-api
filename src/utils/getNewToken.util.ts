import getUnixTime from './getUnixTime.util'
import constants from '../config/constants.config'
import Token from '../models/Token'
import getID from './getID.util'

/**
 * Creates a new token object of a certain type. Returns an ITokenSchema object having token and exp properties.
 * @param type the type of token to be generated
 */
export default function getNewToken (type: 'reset' | 'forgot' | 'confirmation') {
    return new Token({
        token: getID(type),
        exp: Math.floor(getUnixTime() + constants.token.expires / 1000)
    })
}
