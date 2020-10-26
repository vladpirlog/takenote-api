import { Response } from 'express'
import { AuthenticatedUserInfo } from '../types/User'

/**
 * Returns null or an object containing essential info about the user that made the request.
 * @param res object of type express.Response
 */
const getAuthUser = (res: Response): AuthenticatedUserInfo => {
    return res.locals.user ? {
        id: res.locals.user.id,
        role: res.locals.user.role,
        state: res.locals.user.state
    } : { id: '', role: '', state: '' }
}

export default getAuthUser
