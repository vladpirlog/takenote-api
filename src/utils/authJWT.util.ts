import jwt from 'jsonwebtoken'
import constants from '../config/constants.config'
import jwtBlacklistUtil from './jwtBlacklist.util'
import { IDecodedJWT } from '../types/DecodedJWT'
import createID from './createID.util'
import IAuthenticatedUserInfo from '../types/AuthenticatedUserInfo'

/**
 * Generates a JWT using the info in the payload. Returns a string token.
 * @param payload object containing id, role and state of the user
 */
const generateAuthJWT = (payload: IAuthenticatedUserInfo) => {
    const token = jwt.sign(
        { _info: payload.role, _state: payload.state },
        constants.authentication.authJWTSecret,
        {
            expiresIn: `${
                constants.authentication.authCookieAge / (60 * 60 * 1000)
            }h`,
            issuer: constants.domain.apiDomain,
            audience: [constants.domain.baseDomain, constants.domain.apiDomain],
            jwtid: createID('jwt'),
            subject: payload.id,
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
        constants.authentication.authJWTSecret
    ) as IDecodedJWT
    const valid = await jwtBlacklistUtil.check(decoded.jti)
    if (!valid) throw new Error('Blacklisted JWT.')
    return {
        id: decoded.sub,
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
        constants.authentication.authJWTSecret
    ) as IDecodedJWT
    return { id: decoded.jti, exp: decoded.exp }
}

export default { generateAuthJWT, verify, getIDAndExp }
