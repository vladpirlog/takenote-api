import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import getUnixTime from '../utils/getUnixTime.util'
import { ITokenSchema } from '../models/Token'

/**
 * Higher order function for validating a user's token
 * @returns a middleware function
 * @param tokenType the type of token to verify
 * @param isFinalMiddleware if true will send a 200 response, else will call the next middleware
 */
const validateToken = (
    tokenType: 'reset' | 'forgot' | 'confirmation' | 'any',
    isFinalMiddleware: boolean
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.query
            const user = await userQuery.getByToken(
                token as ITokenSchema['_id'],
                tokenType
            )
            if (!user) { return createResponse(res, 401, 'Couldn\'t validate token.') }

            let expirationTime: number
            if (user.resetToken?.id === token) {
                expirationTime = user.resetToken.exp
            } else if (user.forgotToken?.id === token) {
                expirationTime = user.forgotToken.exp
            } else expirationTime = user.confirmationToken.exp

            if (getUnixTime() <= expirationTime) {
                return isFinalMiddleware
                    ? createResponse(res, 200, 'Token valid.')
                    : next()
            }
            return createResponse(res, 401, 'Token expired.')
        } catch (err) { return next(err) }
    }
}

export default validateToken
