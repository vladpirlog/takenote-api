import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import getAuthUser from '../utils/getAuthUser.util'
import twoFactorAuth from '../utils/twoFactorAuth.util'
import cookie from '../utils/cookie.util'
import { IUserSchema } from '../models/User'

/**
 * Controller for generating a qrcode image with the totp secret.abs
 * Will be displayed and scanned by the user.
 */
const generate2faSecret = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userQuery.getById(getAuthUser(res)?._id)
        if (!user || user.twoFactorAuth.active) return createResponse(res, 400)

        const { secret, image } = await twoFactorAuth.generateSecretAndImage(user.email)
        await userQuery.set2faData(getAuthUser(res)?._id, { secret })

        return createResponse(res, 200, 'Image data fetched.', { image })
    } catch (err) { return next(err) }
}

/**
 * Controller for verifying app-generated otp. Used for the login flow and initial 2fa setup.
 */
const verify2faCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, remember } = req.query

        const user = await userQuery.getById(getAuthUser(res)?._id)
        if (!user || !user.twoFactorAuth.secret || block2faVerfication(res.locals.isFullAuth, user)) {
            return createResponse(res, 401)
        }

        if (!isValidOTPOrBackupCode(code as string, user)) return createResponse(res, 403)

        const newNextCheckTime = twoFactorAuth.getNextCheckTime(remember as string | undefined)

        if (user.is2faRequired()) {
            const backupCodeUsed = user.twoFactorAuth.backupCodes?.find(b => b.active && b._id === code)
            const updateData: {
                nextCheck?: IUserSchema['twoFactorAuth']['nextCheck'],
                backupCodes?: IUserSchema['twoFactorAuth']['backupCodes']
            } = {}
            if (newNextCheckTime !== user.twoFactorAuth.nextCheck) updateData.nextCheck = newNextCheckTime

            if (backupCodeUsed) {
                backupCodeUsed.active = false
                updateData.backupCodes = user.twoFactorAuth.backupCodes
            }
            if (newNextCheckTime !== user.twoFactorAuth.nextCheck || backupCodeUsed) {
                await userQuery.set2faData(user.id, updateData)
            }
            return await handle2faOnLogin(req, res, user)
        }

        // executed only on the initial 2fa setup
        return await handleInitial2faSetup(res, newNextCheckTime)
    } catch (err) { return next(err) }
}

const isValidOTPOrBackupCode = (
    code: string, user: IUserSchema
) => {
    const isValidOTP = twoFactorAuth.verifyCode(code as string, user.twoFactorAuth.secret as string)
    const isValidBackupCode = user.twoFactorAuth.backupCodes?.find(b => b.active && b._id === code)
    return isValidOTP || isValidBackupCode
}

const handle2faOnLogin = async (
    req: Request,
    res: Response,
    user: IUserSchema
) => {
    await cookie.clearTfaTempCookie(req, res)
    cookie.setAuthCookie(res, user)
    return createResponse(res, 200, 'Authentication successful.', {
        user: user.getPublicUserInfo()
    })
}

const handleInitial2faSetup = async (
    res: Response,
    newNextCheckTime: IUserSchema['twoFactorAuth']['nextCheck']
) => {
    const backupCodes = twoFactorAuth.generateBackupCodes()
    await userQuery.set2faData(getAuthUser(res)?._id, {
        active: true, nextCheck: newNextCheckTime, backupCodes
    })
    return createResponse(res, 201, 'Two-factor authentication enabled.', { backupCodes })
}

/**
 * Condition for blocking the otp verification request.
 * Prevents users from trying codes when not needed.
 * @param isFullAuth true if the user has AuthStatus.LOGGED_IN
 * @param user object of type IUserSchema
 */
const block2faVerfication = (isFullAuth: boolean, user: IUserSchema) => {
    if (isFullAuth) return !user.is2faInitialSetup()
    return !user.is2faRequired()
}

/**
 * Controller for disabling the 2fa flow. Requires a otp generated by the app.
 */
const disable2fa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query

        const user = await userQuery.getById(getAuthUser(res)?._id)
        if (!user || !user.twoFactorAuth.secret || !user.twoFactorAuth.active) {
            return createResponse(res, 400)
        }

        const ok = twoFactorAuth.verifyCode(code as string, user.twoFactorAuth.secret)

        if (!ok) return createResponse(res, 401)

        await userQuery.remove2faData(getAuthUser(res)?._id)
        return createResponse(res, 200)
    } catch (err) { return next(err) }
}

export default { generate2faSecret, verify2faCode, disable2fa }
