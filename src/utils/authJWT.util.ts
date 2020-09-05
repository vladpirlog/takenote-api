import jwt from 'jsonwebtoken'
import constants from '../config/constants.config'
import jwtBlacklistUtil from './jwtBlacklist.util'
import { IDecodedJWT } from '../interfaces/decodedJWT.interface'
import createID from './createID.util'
import IAuthenticatedUserInfo from '../interfaces/authenticatedUserInfo.interface'

/**
 * Generates a JWT using the info in the payload. Returns a string token.
 * @param payload object containing id, role and state of the user
 */
const generate = (payload: IAuthenticatedUserInfo) => {
    const token = jwt.sign(
        { _info: payload.role, _state: payload.state },
        constants.authentication.jwtSecret,
        {
            expiresIn: `${
                constants.authentication.expires / (60 * 60 * 1000)
            }h`,
            issuer: constants.domain.baseDomain,
            audience: [constants.domain.baseDomain],
            jwtid: createID('jwt'),
            subject: payload._id,
            notBefore: 0
        }
    )
    return token
}

/**
 * Decodes a JWT using the secret. Checks the expiration time and whether the token has been blacklisted or not.
 * Async returns the user info stored in the JWT payload.
 * @param token JWT to check and decode
 */
const verify = async (token: string): Promise<IAuthenticatedUserInfo> => {
    const decoded: IDecodedJWT = jwt.verify(
        token,
        constants.authentication.jwtSecret
    ) as IDecodedJWT
    const valid = await jwtBlacklistUtil.check(decoded.jti)
    if (!valid) throw new Error('Blacklisted JWT.')
    return {
        _id: decoded.sub,
        role: decoded._info,
        state: decoded._state
    }
}

/**
 * Extracts the JWT ID and expiration time from a JWT. Returns an object with id and exp properties.
 * @param token JWT to extract data from
 */
const getIDAndExp = (token: string): { id: string; exp: number } => {
    const decoded: IDecodedJWT = jwt.verify(
        token,
        constants.authentication.jwtSecret
    ) as IDecodedJWT
    return { id: decoded.jti, exp: decoded.exp }
}

export default { generate, verify, getIDAndExp }
