import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import getUnixTime from '../utils/getUnixTime.util'
import { IUserSchema } from '../models/User'
import { ITokenSchema } from '../models/Token'

const validateToken = (
    tokenType: 'reset' | 'forgot' | 'confirmation' | 'any',
    isFinalMiddleware: boolean
) => {
    if (tokenType === 'reset') {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { token } = req.query
                const user = await userQuery.getByToken(
                    token as IUserSchema['resetToken']['token'],
                    'reset'
                )
                if (!user) { return createResponse(res, 404, "Couldn't validate token.") }
                if (getUnixTime() <= user.resetToken.exp) {
                    return isFinalMiddleware
                        ? createResponse(res, 200, 'Reset token valid.')
                        : next()
                }
                return createResponse(res, 401, 'Reset token expired.')
            } catch (err) {
                return createResponse(res, 500, err.message, {
                    error: err
                })
            }
        }
    } else if (tokenType === 'forgot') {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { token } = req.query
                const user = await userQuery.getByToken(
                    token as IUserSchema['forgotToken']['token'],
                    'forgot'
                )
                if (!user) { return createResponse(res, 401, "Couldn't validate token.") }
                if (getUnixTime() <= user.forgotToken.exp) {
                    return isFinalMiddleware
                        ? createResponse(res, 200, 'Reset token valid.')
                        : next()
                }
                return createResponse(res, 401, 'Reset token expired.')
            } catch (err) {
                return createResponse(res, 500, err.message, {
                    error: err
                })
            }
        }
    } else if (tokenType === 'confirmation') {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { token } = req.query
                const user = await userQuery.getByToken(
                    token as IUserSchema['confirmationToken']['token'],
                    'confirmation'
                )
                if (!user) { return createResponse(res, 401, "Couldn't validate token.") }
                if (getUnixTime() <= user.confirmationToken.exp) {
                    return isFinalMiddleware
                        ? createResponse(res, 200, 'Confirmation token valid.')
                        : next()
                }
                return createResponse(res, 401, 'Confirmation token expired.')
            } catch (err) {
                return createResponse(res, 500, err.message, {
                    error: err
                })
            }
        }
    } else {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { token } = req.query
                const user = await userQuery.getByToken(
                    token as ITokenSchema['token'],
                    'any'
                )
                if (!user) { return createResponse(res, 401, "Couldn't validate token.") }
                let expirationTime
                if (user.resetToken && user.resetToken.token === token) { expirationTime = user.resetToken.exp } else if (user.forgotToken && user.forgotToken.token === token) { expirationTime = user.forgotToken.exp } else expirationTime = user.confirmationToken.exp
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
}

export default validateToken
