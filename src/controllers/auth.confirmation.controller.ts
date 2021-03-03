import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import { ITokenSchema } from '../types/Token'
import State from '../enums/State.enum'
import AuthStatus from '../enums/AuthStatus.enum'

const confirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query
        const user = await userQuery.getByToken(
            token as ITokenSchema['id'],
            'confirmation'
        )
        if (!user) return createResponse(res, 400)
        if (user.isTokenExpired('confirmation')) {
            const newUser = await userQuery.setNewToken(user.id, 'confirmation')
            if (!newUser) return createResponse(res, 400)

            await sendEmailUtil.sendToken(newUser, 'confirmation')
            return createResponse(
                res,
                202,
                'Confirmation token has expired. A new confirmation token was sent to the user\'s email address.'
            )
        }

        const newUser = await userQuery.setUserState(user.id, State.ACTIVE)
        if (!newUser) return createResponse(res, 400)
        if (req.session.authenticationStatus === AuthStatus.LOGGED_IN) {
            // only refresh the cookie if the user is authenticated while confirming the email address
            req.session.userState = State.ACTIVE
        }
        return createResponse(res, 200, 'Email address confirmed.')
    } catch (err) { return next(err) }
}

const requestConfirmationToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const newUser = await userQuery.setNewToken(req.session.userID, 'confirmation')
        if (!newUser) return createResponse(res, 400)

        await sendEmailUtil.sendToken(newUser, 'confirmation')

        return createResponse(
            res,
            200,
            'Confirmation token sent to the user\'s email address.'
        )
    } catch (err) { return next(err) }
}

export default {
    confirm,
    requestConfirmationToken
}
