import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'

export default async function checkUniqueUser (
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { username, email } = req.body
    try {
        const user = await userQuery.getByUsernameOrEmail(username, email)
        if (user) return createResponse(res, 409, 'User already exists.')
        return next()
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}
