import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import getUnixTime from '../utils/getUnixTime.util'
import { ITokenSchema } from '../types/Token'

/**
 * Middleware used for checking the expiration time of a given token.
 */
const validateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query
        const user = await userQuery.getByToken(token as ITokenSchema['id'])

        if (!user) { return createResponse(res, 401, 'Couldn\'t validate token.') }

        const expTime = [user.confirmationToken, user.resetToken]
            .filter(elem => elem && elem.id === token)[0]?.exp

        if (expTime && getUnixTime() <= expTime) {
            return createResponse(res, 200, 'Token valid.')
        }
        return createResponse(res, 401, 'Token expired.')
    } catch (err) { return next(err) }
}

export default validateToken
