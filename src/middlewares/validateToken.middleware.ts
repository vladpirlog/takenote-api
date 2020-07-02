import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import getUnixTime from '../utils/getUnixTime.util'
import { ITokenSchema } from '../models/Token'

const validateToken = (
    tokenType: 'reset' | 'forgot' | 'confirmation' | 'any',
    isFinalMiddleware: boolean
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.query
            const user = await userQuery.getByToken(
                token as ITokenSchema['token'],
                tokenType
            )
            if (!user) { return createResponse(res, 401, "Couldn't validate token.") }

            const expirationTime = [
                user.resetToken,
                user.forgotToken,
                user.confirmationToken
            ].filter(t => t.token === token)[0]?.exp

            if (!expirationTime) { return createResponse(res, 401, "Couldn't validate token.") }

            if (getUnixTime() <= expirationTime) {
                return isFinalMiddleware
                    ? createResponse(res, 200, 'Token valid.')
                    : next()
            }
            return createResponse(res, 401, 'Token expired.')
        } catch (err) {
            return createResponse(res, 500, err.message, {
                error: err
            })
        }
    }
}

export default validateToken
