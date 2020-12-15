import { Response } from 'express'
import { AuthenticatedUserInfo } from '../types/User'

/**
 * Get basic info about the user making the request.
 * @param res object of type express.Response
 * @returns an object with id, role and state properties; if the user is not authenticated,
 * every value in the response object is an empty string
 */
const getAuthUser = (res: Response): AuthenticatedUserInfo => {
    return res.locals.user ? {
        id: res.locals.user.id,
        role: res.locals.user.role,
        state: res.locals.user.state
    } : { id: '', role: '', state: '' }
}

export default getAuthUser
