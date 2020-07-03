import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../models/User'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'

const requestResetToken = async (
    req: Request,
    res: Response
) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(res.locals.user.userID)
        if (!user) return createResponse(res, 400)

        if (user.validPassword(oldPassword)) {
            const newUser = await userQuery.setNewToken(
                res.locals.user.userID,
                'reset'
            )
            if (!newUser) return createResponse(res, 400)

            await sendEmailUtil.sendToken(newUser, 'reset')
            return createResponse(res, 200, 'Reset token sent.')
        }
        return createResponse(res, 401, 'Wrong credentials.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const requestForgotToken = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body

        const user = await userQuery.setNewToken(email, 'forgot')
        if (!user) return createResponse(res, 400)

        await sendEmailUtil.sendToken(user, 'forgot')
        return createResponse(res, 200, 'Forgot token sent.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const submitResetToken = async (
    req: Request,
    res: Response) => {
    try {
        const { new_password: newPassword } = req.body
        const { token } = req.query

        const newUser = await userQuery.setNewPassword(
            res.locals.user.userID,
            newPassword,
            token as IUserSchema['resetToken']['token']
        )
        return newUser ? createResponse(res, 200, 'Password changed.')
            : createResponse(res, 400)
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const submitForgotToken = async (
    req: Request,
    res: Response
) => {
    try {
        const { new_password: newPassword } = req.body
        const { token } = req.query

        const newUser = await userQuery.setNewPassword(
            null,
            newPassword,
            token as IUserSchema['forgotToken']['token']
        )
        return newUser ? createResponse(res, 200, 'Password changed.')
            : createResponse(res, 400)
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default {
    requestResetToken,
    requestForgotToken,
    submitResetToken,
    submitForgotToken
}
