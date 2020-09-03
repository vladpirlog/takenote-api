import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IUserSchema } from '../models/User'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import getAuthUser from '../utils/getAuthUser.util'

const requestResetToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(getAuthUser(res)?._id)
        if (!user) return createResponse(res, 400)

        if (user.validPassword(oldPassword)) {
            return await handleSendingToken(res, getAuthUser(res)?._id, 'reset')
        }
        return createResponse(res, 401)
    } catch (err) { return next(err) }
}

const requestForgotToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        return await handleSendingToken(res, email, 'forgot')
    } catch (err) { return next(err) }
}

const handleSendingToken = async (
    res: Response,
    userIdentifier: IUserSchema['_id'] | IUserSchema['email'],
    type: 'reset' | 'forgot'
) => {
    const user = await userQuery.setNewToken(userIdentifier, type)
    if (!user) return createResponse(res, 400)

    await sendEmailUtil.sendToken(user, type)
    return createResponse(res, 200, 'Token sent.')
}

const submitToken = (type: 'reset' | 'forgot') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { new_password: newPassword } = req.body
            const { token } = req.query

            const userIdentifier = type === 'reset' ? getAuthUser(res)?._id : null

            const newUser = await userQuery.setNewPassword(
                userIdentifier,
                newPassword,
                token as IUserSchema['resetToken']['_id']
            )
            return newUser
                ? createResponse(res, 200, 'Password changed.')
                : createResponse(res, 400)
        } catch (err) { return next(err) }
    }
}

export default {
    requestResetToken,
    requestForgotToken,
    submitResetToken: submitToken('reset'),
    submitForgotToken: submitToken('forgot')
}
