import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import getAuthUser from '../utils/getAuthUser.util'
import { ITokenSchema } from '../models/Token'

const requestResetTokenWithEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        const user = await userQuery.setNewToken(email, 'reset')
        if (!user) return createResponse(res, 400)

        await sendEmailUtil.sendToken(user, 'reset')
        return createResponse(res, 200, 'Token sent.')
    } catch (err) { return next(err) }
}

const requestResetTokenWithPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(getAuthUser(res).id)
        if (!user) return createResponse(res, 400)

        if (await user.validPassword(oldPassword)) {
            const newUser = await userQuery.setNewToken(user.id, 'reset')
            if (!newUser) return createResponse(res, 400)

            await sendEmailUtil.sendToken(newUser, 'reset')
            return createResponse(res, 200, 'Token sent.')
        }
        return createResponse(res, 401)
    } catch (err) { return next(err) }
}

const submitToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { new_password: newPassword } = req.body
        const { token } = req.query

        const user = await userQuery.getByToken(token as ITokenSchema['id'], 'reset')
        if (!user || user.isTokenExpired('reset')) return createResponse(res, 400)

        const newUser = await userQuery.setNewPassword(
            newPassword,
            token as string
        )
        return newUser
            ? createResponse(res, 200, 'Password changed.')
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

export default {
    requestResetTokenWithEmail,
    requestResetTokenWithPassword,
    submitToken
}
