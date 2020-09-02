import { Response } from 'express'
import { IUserSchema } from '../models/User'
import constants from '../config/constants.config'
import authJWT from './authJWT.util'

/**
 * Sets a JWT as an authentication cookie for the given user
 * @param res object of type express.Response
 * @param user the owner of the cookie
 */
const setAuthCookie = (res: Response, user: IUserSchema): Response => {
    const token = authJWT.generate({
        _id: user.id,
        role: user.role,
        state: user.state
    })
    res.cookie('access_token', token, {
        expires: new Date(
            Date.now() + constants.authentication.expires
        ),
        httpOnly: true,
        sameSite: 'lax'
        // secure: true,
        // TODO: add secure flag
    })
    return res
}

export default setAuthCookie
