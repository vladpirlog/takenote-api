import { Request, Response, NextFunction } from 'express'
import AuthStatus from '../enums/AuthStatus.enum'
import createResponse from '../utils/createResponse.util'

/**
 * Higher-order function that checks the authentication state of the user.
 * @param status an array of AuthStatus elements; the user must be in one of those states
 */
const checkAuthStatus = (status: AuthStatus[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            status.includes(AuthStatus.LOGGED_IN) &&
            req.session.authenticationStatus === AuthStatus.LOGGED_IN
        ) return next()

        if (
            status.includes(AuthStatus.TFA_LOGGED_IN) &&
            req.session.authenticationStatus === AuthStatus.TFA_LOGGED_IN
        ) return next()

        if (
            status.includes(AuthStatus.NOT_LOGGED_IN) &&
            !req.session.userID
        ) return next()
        return createResponse(res, 401)
    }
}

export default checkAuthStatus
