import { Response } from 'express'
import IAuthenticatedUserInfo from '../interfaces/authenticatedUserInfo.interface'

/**
 * Returns null or an object containing essential info about the user that made the request.
 * @param res object of type express.Response
 */
const getAuthenticatedUser = (res: Response): IAuthenticatedUserInfo | null => {
    return res.locals.user ? {
        _id: res.locals.user._id,
        role: res.locals.user.role,
        state: res.locals.user.state
    } : null
}

export default getAuthenticatedUser
