import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import { IUserSchema } from '../types/User'
import cookie from '../utils/cookie.util'
import getAuthUser from '../utils/getAuthUser.util'
import authJWT from '../utils/authJWT.util'
import jwtBlacklist from '../utils/jwtBlacklist.util'
import constants from '../config/constants.config'
import { ITokenSchema } from '../types/Token'
import State from '../enums/State.enum'

const confirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query
        const user = await userQuery.getByToken(
            token as ITokenSchema['id'],
            'confirmation'
        )
        if (!user) return createResponse(res, 400)
        if (user.isTokenExpired('confirmation')) {
            return await handleSendNewToken(res, user.id)
        }
        return await handleConfirmation(
            res,
            user.id,
            req.cookies[constants.authentication.authCookieName]
        )
    } catch (err) { return next(err) }
}

const requestConfirmationToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await userQuery.setNewToken(
            getAuthUser(res).id,
            'confirmation'
        )
        if (!newUser) return createResponse(res, 400)

        await sendEmailUtil.sendToken(newUser, 'confirmation')

        return createResponse(
            res,
            200,
            'Confirmation token sent to the user\'s email address.'
        )
    } catch (err) { return next(err) }
}

const handleConfirmation = async (res: Response, userID: IUserSchema['id'], authCookie: string) => {
    const newUser = await userQuery.setUserState(userID, State.ACTIVE)
    if (!newUser) return createResponse(res, 400)
    if (getAuthUser(res).id) {
        // only refresh the cookie if the user is authenticated while confirming the email address
        const { id, exp } = authJWT.getIDAndExp(authCookie)
        await jwtBlacklist.add(id, exp)
        cookie.clearAuthCookie(res)
        cookie.setAuthCookie(res, newUser)
    }
    return createResponse(res, 200, 'Email address confirmed.')
}

const handleSendNewToken = async (res: Response, userID: IUserSchema['id']) => {
    const newUser = await userQuery.setNewToken(userID, 'confirmation')
    if (!newUser) return createResponse(res, 400)

    await sendEmailUtil.sendToken(newUser, 'confirmation')
    return createResponse(
        res,
        202,
        'Confirmation token has expired. A new confirmation token was sent to the user\'s email address.'
    )
}

export default {
    confirm,
    requestConfirmationToken
}
