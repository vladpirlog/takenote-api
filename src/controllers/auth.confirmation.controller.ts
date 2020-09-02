import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import getUnixTime from '../utils/getUnixTime.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import { IUserSchema } from '../models/User'
import { State } from '../interfaces/state.enum'
import setAuthCookie from '../utils/setAuthCookie.util'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'
import authJWT from '../utils/authJWT.util'
import jwtBlacklist from '../utils/jwtBlacklist.util'

const confirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query
        const user = await userQuery.getByToken(
            token as IUserSchema['confirmationToken']['_id'],
            'confirmation'
        )
        if (!user) return createResponse(res, 400)
        if (getUnixTime() <= user.confirmationToken.exp) {
            const newUser = await userQuery.setUserState(user.id, State.ACTIVE)
            if (!newUser) return createResponse(res, 400)
            if (getAuthenticatedUser(res)) {
                // only refresh the cookie if the user is authenticated while confirming the email address
                const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
                await jwtBlacklist.add(id, exp)
                res.clearCookie('access_token')
                setAuthCookie(res, newUser)
            }
            return createResponse(res, 200, 'Email address confirmed.')
        } else {
            const newUser = await userQuery.setNewToken(
                user.id,
                'confirmation'
            )
            if (!newUser) return createResponse(res, 400)
            await sendEmailUtil.sendToken(newUser, 'confirmation')
            return createResponse(
                res,
                202,
                'Confirmation token has expired. A new confirmation token was sent to the user\'s email address.'
            )
        }
    } catch (err) { return next(err) }
}

const requestConfirmationToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await userQuery.setNewToken(
            getAuthenticatedUser(res)?._id,
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

export default {
    confirm,
    requestConfirmationToken
}
