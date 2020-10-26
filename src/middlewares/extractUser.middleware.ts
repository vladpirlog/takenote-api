import { Request, Response, NextFunction } from 'express'
import authJWT from '../utils/authJWT.util'
import constants from '../config/constants.config'
import getAuthUser from '../utils/getAuthUser.util'
import redisConfig from '../config/redis.config'

/**
 * Middleware function that identifies the user making the request based on the JWT cookie.
 * Saves user info in res.locals.user (id, role, state).
 * Sets the res.locals.isFullAuth flag to true.
 */
const fromAuthCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authCookie: string | undefined = req.cookies[constants.authentication.authCookieName]
        if (authCookie) {
            res.locals.user = await authJWT.verify(authCookie)
            res.locals.isFullAuth = true
        } else {
            res.locals.user = null
            res.locals.isFullAuth = false
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Middleware function that identifies the user making the request based on the tfa temporary cookie.
 * Saves user info in res.locals.user (id, role, state).
 * Sets the res.locals.isFullAuth flag to false.
 */
const fromTfaTempCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tfaTempCookie: string | undefined = req.cookies[constants.authentication.tfaTempCookieName]
        if (getAuthUser(res).id || !tfaTempCookie) return next()

        const value = await redisConfig.getClient().promiseGet(tfaTempCookie)
        res.locals.user = value ? JSON.parse(value) : null
        res.locals.isFullAuth = false
        return next()
    } catch (err) { return next(err) }
}

export default { fromAuthCookie, fromTfaTempCookie }
