import { Request, Response, NextFunction } from 'express'
import { IUserSchema } from '../models/User'
import createResponse from '../utils/createResponse.util'

/**
 * Function that verifies if the user has one of the required roles.
 * @param roles an array of roles that the user must be in
 */
const checkUserRole = (roles: IUserSchema['role'][]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            return roles.includes(res.locals.user.role)
                ? next() : createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export default checkUserRole
