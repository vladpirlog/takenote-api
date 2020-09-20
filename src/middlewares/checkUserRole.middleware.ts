import { Request, Response, NextFunction } from 'express'
import { IUserSchema } from '../models/User'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'

/**
 * Higher-order function that verifies if the user has one of the required roles.
 * @param roles an array of roles that the user must be in
 */
const checkUserRole = (roles: IUserSchema['role'][]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = getAuthUser(res)?.role

            return userRole && roles.includes(userRole)
                ? next() : createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export default checkUserRole
