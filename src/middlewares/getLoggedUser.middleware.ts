import { Request, Response, NextFunction } from 'express'
import authJWT from '../utils/authJWT.util'
import createResponse from '../utils/createResponse.util'

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
        if (req.cookies.access_token) { res.locals.user = await authJWT.verify(req.cookies.access_token) } else res.locals.user = null
        return next()
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}
