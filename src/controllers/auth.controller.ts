import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import { LoginBody, OldPasswordBody, RegisterBody } from '../types/RequestBodies'
import State from '../enums/State.enum'
import AuthStatus from '../enums/AuthStatus.enum'

const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const user = await userQuery.getById(req.session.userID)
        return user
            ? createResponse(res, 200, 'User found.', { user: user.getPublicInfo() })
            : createResponse(res, 404, 'User not found.')
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
            req.session.authenticationStatus = AuthStatus.TFA_LOGGED_IN
            req.session.userID = user.id
            req.session.isOAuthUser = user.isOAuthUser()
            req.session.userState = user.state
            req.session.userRole = user.role
            req.session.userEmail = user.email
            return createResponse(res, 202, 'First authentication step successful.')
        }

        req.session.authenticationStatus = AuthStatus.LOGGED_IN
        req.session.userID = user.id
        req.session.isOAuthUser = user.isOAuthUser()
        req.session.userState = user.state
        req.session.userRole = user.role
        req.session.userEmail = user.email
        return createResponse(res, 200, 'Authentication successful.', {
            user: user.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.session.destroy(console.error)
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
        if (!req.session.userID) throw new Error('User not logged in.')
        const { old_password: oldPassword } = req.body as OldPasswordBody
        const user = await userQuery.getById(req.session.userID)
        if (!user) return createResponse(res, 400)

        const isValidPassword = await user.validPassword(oldPassword)
        if (!isValidPassword) return createResponse(res, 401)

        const newUser = await userQuery.setUserState(req.session.userID, State.DELETING)
        if (!newUser) return createResponse(res, 400)
        await sendEmailUtil.sendNotice(newUser, 'delete')

        req.session.userState = State.DELETING
        return createResponse(res, 200, 'Account is being deleted.')
    } catch (err) { return next(err) }
}

const recoverUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const newUser = await userQuery.setUserState(req.session.userID, State.ACTIVE)
        if (!newUser) return createResponse(res, 400)
        await sendEmailUtil.sendNotice(newUser, 'recover')

        req.session.userState = State.ACTIVE
        return createResponse(res, 200, 'Account is now active.')
    } catch (err) { return next(err) }
}

export default { getMe, login, logout, register, deleteUser, recoverUser }
