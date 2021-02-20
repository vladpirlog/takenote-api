import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import authJWT from '../utils/authJWT.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import jwtBlacklist from '../utils/jwtBlacklist.util'
import cookie from '../utils/cookie.util'
import getAuthUser from '../utils/getAuthUser.util'
import constants from '../config/constants.config'
import { LoginBody, OldPasswordBody, RegisterBody } from '../types/RequestBodies'
import State from '../enums/State.enum'

const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userQuery.getById(getAuthUser(res).id)
        return user ? createResponse(res, 200, 'User found.', {
            user: user.getPublicInfo()
        }) : createResponse(res, 404, 'User not found.')
    } catch (err) { return next(err) }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as LoginBody

        const user = await userQuery.getByEmail(email)
        if (!user || user.isOAuthUser() || !await user.validPassword(password)) {
            return createResponse(res, 401)
        }

        if (user.is2faRequiredOnLogin()) {
            await cookie.set2faTempCookie(res, user)
            return createResponse(res, 202, 'First authentication step successful.')
        }

        cookie.setAuthCookie(res, user)
        return createResponse(res, 200, 'Authentication successful.', {
            user: user.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, exp } = authJWT.getIDAndExp(req.cookies[constants.authentication.authCookieName])
        await jwtBlacklist.add(id, exp)
        cookie.clearAuthCookie(res)
        return createResponse(res, 200, 'User logged out.')
    } catch (err) { return next(err) }
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as RegisterBody
        const user = await userQuery.createNewUser({
            email,
            password
        })
        if (!user) {
            return createResponse(res, 400, 'Couldn\'t create user.')
        }
        await sendEmailUtil.sendToken(user, 'confirmation')
        return createResponse(res, 201, 'User created successfully.', {
            user: user.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

// TODO: delete users from db after some time
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body as OldPasswordBody
        const user = await userQuery.getById(getAuthUser(res).id)
        if (!user) return createResponse(res, 400)
        if (await user.validPassword(oldPassword)) {
            return await handleDeleteOrRecover(res, req.cookies[constants.authentication.authCookieName], 'delete')
        }
        return createResponse(res, 401)
    } catch (err) { return next(err) }
}

const recoverUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await handleDeleteOrRecover(res, req.cookies[constants.authentication.authCookieName], 'recover')
    } catch (err) { return next(err) }
}

const handleDeleteOrRecover = async (res: Response, authCookie: string, type: 'delete' | 'recover') => {
    const dynamicData = type === 'delete'
        ? { state: State.DELETING, message: 'Account is being deleted.' }
        : { state: State.ACTIVE, message: 'Account is now active.' }

    const newUser = await userQuery.setUserState(
        getAuthUser(res).id,
        dynamicData.state
    )
    if (!newUser) return createResponse(res, 400)
    await sendEmailUtil.sendNotice(newUser, type)

    const { id, exp } = authJWT.getIDAndExp(authCookie)
    await jwtBlacklist.add(id, exp)

    cookie.clearAuthCookie(res)
    cookie.setAuthCookie(res, newUser)
    return createResponse(res, 200, dynamicData.message)
}

export default { getMe, login, logout, register, deleteUser, recoverUser }
