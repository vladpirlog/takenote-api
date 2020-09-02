import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import authJWT from '../utils/authJWT.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import createNewToken from '../utils/createNewToken.util'
import { State } from '../interfaces/state.enum'
import jwtBlacklist from '../utils/jwtBlacklist.util'
import setAuthCookie from '../utils/setAuthCookie.util'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'

const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userQuery.getById(getAuthenticatedUser(res)?._id)
        return user ? createResponse(res, 200, 'User found.', {
            user: {
                _id: user.id,
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
            setAuthCookie(res, user)
            return createResponse(res, 200, 'Authentication successful.', {
                user: {
                    _id: user.id,
                    email: user.email,
                    username: user.username
                }
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
        return createResponse(res, 201, 'User created successfully.', {
            user: {
                _id: newUser.id,
                email: newUser.email,
                username: newUser.username
            }
        })
    } catch (err) { return next(err) }
}

// TODO: delete users from db after some time
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(getAuthenticatedUser(res)?._id)
        if (!user) return createResponse(res, 400)
        if (user.validPassword(oldPassword)) {
            const newUser = await userQuery.setUserState(
                getAuthenticatedUser(res)?._id,
                State.DELETING
            )
            if (!newUser) return createResponse(res, 400)
            await sendEmailUtil.sendNotice(newUser, 'delete')
            const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
            await jwtBlacklist.add(id, exp)
            res.clearCookie('access_token')
            setAuthCookie(res, newUser)
            return createResponse(res, 200, 'Account is being deleted.')
        }
        return createResponse(res, 401, 'Wrong credentials.')
    } catch (err) { return next(err) }
}

const recoverUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newUser = await userQuery.setUserState(
            getAuthenticatedUser(res)?._id,
            State.ACTIVE
        )
        if (!newUser) return createResponse(res, 400)
        await sendEmailUtil.sendNotice(newUser, 'recover')
        const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
        await jwtBlacklist.add(id, exp)
        res.clearCookie('access_token')
        setAuthCookie(res, newUser)
        return createResponse(res, 200, 'Account is now active.')
    } catch (err) { return next(err) }
}

export default { getMe, login, logout, register, deleteUser, recoverUser }
