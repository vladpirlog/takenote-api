import { Request, Response } from 'express'
import { IUserSchema, AuthenticatedUserInfo } from '../types/User'
import constants from '../config/constants.config'
import authJWT from './authJWT.util'
import createID from './createID.util'
import redisConfig from '../config/redis.config'

const setCookie = (res: Response, key: string, value: string, age: number) => {
    res.cookie(key, value, {
        expires: new Date(Date.now() + age),
        httpOnly: true,
        sameSite: 'lax',
        secure: constants.protocol === 'https',
        domain: constants.nodeEnv === 'production' ? constants.domain.baseDomain : ''
    })
    return res
}

/**
 * Sets a JWT as an authentication cookie for the given user
 * @param res object of type express.Response
 * @param user the owner of the cookie
 */
const setAuthCookie = (res: Response, user: IUserSchema): Response => {
    const token = authJWT.generateAuthJWT({
        id: user.id,
        role: user.role,
        state: user.state
    })
    return setCookie(
        res,
        constants.authentication.authCookieName,
        token,
        constants.authentication.authCookieAge
    )
}

const clearAuthCookie = (res: Response): Response => {
    res.clearCookie(constants.authentication.authCookieName)
    return res
}

/**
 * Sets a temporary cookie for the given user and stores it in redis
 * @param res object of type express.Response
 * @param user the owner of the cookie
 */
const set2faTempCookie = async (res: Response, user: IUserSchema): Promise<Response> => {
    const tfaCookieID = createID('tfa')
    const userData: AuthenticatedUserInfo = {
        id: user.id, state: user.state, role: user.role
    }
    const redisClient = await redisConfig.getClient()
    await new Promise((resolve, reject) => {
        redisClient.setex(
            tfaCookieID,
            Math.floor(constants.authentication.tfaTempCookieAge / 1000),
            JSON.stringify(userData),
            (err, res) => {
                if (err) return reject(err)
                return resolve(res)
            }
        )
    })
    return setCookie(
        res,
        constants.authentication.tfaTempCookieName,
        tfaCookieID,
        constants.authentication.tfaTempCookieAge
    )
}

const clearTfaTempCookie = async (req: Request, res: Response): Promise<Response> => {
    const tfaCookieID: string | undefined = req.cookies[constants.authentication.tfaTempCookieName]
    if (!tfaCookieID) return res

    res.clearCookie(constants.authentication.tfaTempCookieName)
    const redisClient = await redisConfig.getClient()
    await new Promise((resolve, reject) => {
        redisClient.del(tfaCookieID, (err, res) => {
            if (err) return reject(err)
            return resolve(res)
        })
    })
    return res
}

export default { setAuthCookie, clearAuthCookie, set2faTempCookie, clearTfaTempCookie }
