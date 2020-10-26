import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { AuthStatus } from '../types/AuthStatus'

/**
 * Higher-order function that checks the authentication state of the user.
 * @param status an array of AuthStatus elements; the user must be in one of those states
 */
const checkAuthStatus = (status: AuthStatus[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            status.includes(AuthStatus.LOGGED_IN) &&
            res.locals.user &&
            res.locals.isFullAuth
        ) return next()

        if (
            status.includes(AuthStatus.TFA_LOGGED_IN) &&
            res.locals.user &&
            !res.locals.isFullAuth
        ) return next()

        if (
            status.includes(AuthStatus.NOT_LOGGED_IN) &&
            !res.locals.user
        ) return next()
        return createResponse(res, 401)
    }
}

export default checkAuthStatus
