import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../models/User'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'

const requestResetToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(getAuthenticatedUser(res)?.userID)
        if (!user) return createResponse(res, 400)

        if (user.validPassword(oldPassword)) {
            const newUser = await userQuery.setNewToken(
                getAuthenticatedUser(res)?.userID,
                'reset'
            )
            if (!newUser) return createResponse(res, 400)

            await sendEmailUtil.sendToken(newUser, 'reset')
            return createResponse(res, 200, 'Reset token sent.')
        }
        return createResponse(res, 401, 'Wrong credentials.')
    } catch (err) { return next(err) }
}

const requestForgotToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        const user = await userQuery.setNewToken(email, 'forgot')
        if (!user) return createResponse(res, 400)

        await sendEmailUtil.sendToken(user, 'forgot')
        return createResponse(res, 200, 'Forgot token sent.')
    } catch (err) { return next(err) }
}

const submitResetToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { new_password: newPassword } = req.body
        const { token } = req.query

        const newUser = await userQuery.setNewPassword(
            getAuthenticatedUser(res)?.userID,
            newPassword,
            token as IUserSchema['resetToken']['_id']
        )
        return newUser ? createResponse(res, 200, 'Password changed.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const submitForgotToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { new_password: newPassword } = req.body
        const { token } = req.query

        const newUser = await userQuery.setNewPassword(
            null,
            newPassword,
            token as IUserSchema['forgotToken']['_id']
        )
        return newUser ? createResponse(res, 200, 'Password changed.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

export default {
    requestResetToken,
    requestForgotToken,
    submitResetToken,
    submitForgotToken
}
