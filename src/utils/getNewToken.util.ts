import getUnixTime from './getUnixTime.util'
import constants from '../config/constants'
import randomString from './randomString.util'
import Token from '../models/Token'

/**
 * Creates a new token object of a certain type. Returns an ITokenSchema object having token and exp properties.
 * @param type the type of token to be generated
 */
export default function getNewToken (type: 'reset' | 'forgot' | 'confirmation') {
    return new Token({
        token: randomString(
            type === 'confirmation'
                ? constants.token.confirmationLength
                : type === 'forgot'
                    ? constants.token.forgotLength
                    : constants.token.resetLength
        ),
        exp: Math.floor(getUnixTime() + constants.token.expires / 1000)
    })
}
