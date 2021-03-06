import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import { EmailBody } from '../types/RequestBodies'

/**
 * Higher order function for checking if a user already has the given email
 * @returns a middleware function
 * @param isFinalMiddleware if true will send a 200 response, else will call the next middleware
 */
const checkUniqueUser = (isFinalMiddleware: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body as EmailBody
            const user = await userQuery.getByEmail(email)
            if (user) return createResponse(res, 409, 'User already exists.')
            return isFinalMiddleware
                ? createResponse(res, 200)
                : next()
        } catch (err) { return next(err) }
    }
}

export default checkUniqueUser
