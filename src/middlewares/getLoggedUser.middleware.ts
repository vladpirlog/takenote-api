import { Request, Response, NextFunction } from 'express'
import authJWT from '../utils/authJWT.util'

/**
 * Middleware function that identifies the user making the request based on the JWT cookie.
 * It saves user info in res.locals.user (userID, role, state).
 */
export default async function getLoggedUser (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        res.locals.user = req.cookies.access_token
            ? await authJWT.verify(req.cookies.access_token) : null
        return next()
    } catch (err) { return next(err) }
}
