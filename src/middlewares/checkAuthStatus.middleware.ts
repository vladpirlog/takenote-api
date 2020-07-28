import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Function that returns a middleware function that checks if the user is/isn't logged in.
 * @param loggedIn a boolean representing the requirement for being/not being authenticated
 */
export default function checkAuthStatus (loggedIn: boolean) {
    if (loggedIn) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (!res.locals.user) return createResponse(res, 401, 'User not logged in.')
            return next()
        }
    } else {
        return (req: Request, res: Response, next: NextFunction) => {
            if (res.locals.user) return createResponse(res, 401, 'User already logged in.')
            return next()
        }
    }
}
