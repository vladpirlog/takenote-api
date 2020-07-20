import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import authJWT from '../utils/authJWT.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import createNewToken from '../utils/createNewToken.util'
import { State } from '../interfaces/state.enum'
import jwtBlacklist from '../utils/jwtBlacklist.util'
import setAuthCookie from '../utils/setAuthCookie.util'
import logging from '../utils/logging.util'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'

const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userQuery.getById(getAuthenticatedUser(res)?.userID)
        return user ? createResponse(res, 200, 'User found.', {
            user: {
                userID: user.id,
                username: user.username,
                email: user.email
            }
        }) : createResponse(res, 404, 'User not found.')
    } catch (err) { return next(err) }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body
        const user = await userQuery.getByUsernameOrEmail(email)
        if (!user) return createResponse(res, 401)
        if (user.validPassword(password)) {
            res = setAuthCookie(res, user)
            await logging(req.ip, user.id, 'login', true)
            return createResponse(res, 200, 'Authentication successful.', {
                userID: user.id
            })
        }
        return createResponse(res, 401)
    } catch (err) { return next(err) }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
        await jwtBlacklist.add(id, exp)
        res.clearCookie('access_token')
        await logging(req.ip, getAuthenticatedUser(res)?.userID, 'logout', true)
        return createResponse(res, 200, 'User logged out.')
    } catch (err) { return next(err) }
}

const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body
        const confirmationToken = createNewToken('confirmation')
        const newUser = await userQuery.createNewUser({
            username,
            email,
            password,
            confirmationToken
        })
        if (!newUser) {
            return createResponse(res, 400, 'Couldn\'t create user.')
        }
        await sendEmailUtil.sendToken(newUser, 'confirmation')
        await logging(req.ip, newUser.id, 'register', true)
        return createResponse(res, 201, 'User created successfully.', {
            userID: newUser.id
        })
    } catch (err) { return next(err) }
}

// TODO: delete users from db after some time
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(getAuthenticatedUser(res)?.userID)
        if (!user) return createResponse(res, 400)
        if (user.validPassword(oldPassword)) {
            const newUser = await userQuery.setUserState(
                getAuthenticatedUser(res)?.userID,
                State.DELETING
            )
            if (!newUser) return createResponse(res, 400)
            await sendEmailUtil.sendNotice(newUser, 'delete')
            const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
            await jwtBlacklist.add(id, exp)
            res.clearCookie('access_token')
            res = setAuthCookie(res, newUser)
            return createResponse(res, 200, 'Account is being deleted.')
        }
        return createResponse(res, 401, 'Wrong credentials.')
    } catch (err) { return next(err) }
}

const recoverUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await userQuery.setUserState(
            getAuthenticatedUser(res)?.userID,
            State.ACTIVE
        )
        if (!newUser) return createResponse(res, 400)
        await sendEmailUtil.sendNotice(newUser, 'recover')
        const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
        await jwtBlacklist.add(id, exp)
        res.clearCookie('access_token')
        res = setAuthCookie(res, newUser)
        return createResponse(res, 200, 'Account is now active.')
    } catch (err) { return next(err) }
}

export default { getMe, login, logout, register, deleteUser, recoverUser }
