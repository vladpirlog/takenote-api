import { Request, Response } from 'express'
import constants from '../config/constants'
import createResponse from '../utils/createResponse.util'
import authJWT from '../utils/authJWT.util'
import sendEmailUtil from '../utils/sendEmail.util'
import userQuery from '../queries/user.query'
import getNewToken from '../utils/getNewToken.util'
import { State } from '../interfaces/state.enum'
import jwtBlacklist from '../utils/jwtBlacklist.util'

const getMe = async (req: Request, res: Response) => {
    try {
        const user = await userQuery.getById(res.locals.user.userID)
        if (!user) return createResponse(res, 404, 'User not found.')

        return createResponse(res, 200, 'User found.', {
            user: {
                userID: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const user = await userQuery.getByUsernameOrEmail(email)
        if (!user) return createResponse(res, 401)
        else {
            if (user.validPassword(password)) {
                const token = authJWT.generate({
                    userID: user.id,
                    role: user.role,
                    state: user.state
                })
                res.cookie('access_token', token, {
                    expires: new Date(
                        Date.now() + constants.authentication.expires
                    ),
                    httpOnly: true,
                    sameSite: 'lax'
                    // secure: true,
                    // add secure flag
                })
                return createResponse(res, 200, 'Authentication successful.', {
                    userID: user.id
                })
            } else return createResponse(res, 401)
        }
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        const { id, exp } = authJWT.getIDAndExp(req.cookies.access_token)
        await jwtBlacklist.add(id, exp)
        res.clearCookie('access_token')
        return createResponse(res, 200, 'User logged out.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body

        const confirmationToken = getNewToken('confirmation')

        const newUser = await userQuery.createNewUser({
            username,
            email,
            password,
            confirmationToken
        })
        if (!newUser) return createResponse(res, 400, 'Couldn\'t create user.')

        await sendEmailUtil.sendToken(newUser, 'confirmation')

        return createResponse(res, 201, 'User created successfully.', {
            userID: newUser.id
        })
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

// TODO: delete users from db after some time
const deleteUser = async (req: Request, res: Response) => {
    try {
        const { old_password: oldPassword } = req.body
        const user = await userQuery.getById(res.locals.user.userID)
        if (!user) return createResponse(res, 400)

        if (user.validPassword(oldPassword)) {
            const newUser = await userQuery.setUserState(
                res.locals.user.userID,
                State.DELETING
            )
            if (!newUser) return createResponse(res, 400)

            await sendEmailUtil.sendDeletingNotice(newUser)

            res.clearCookie('access_token')
            const token = authJWT.generate({
                userID: newUser.id,
                role: newUser.role,
                state: newUser.state
            })
            res.cookie('access_token', token, {
                expires: new Date(
                    Date.now() + constants.authentication.expires
                ),
                httpOnly: true,
                sameSite: 'lax'
                // secure: true,
                // add secure flag
            })
            return createResponse(res, 200, 'Account is being deleted.')
        }
        return createResponse(res, 401, 'Wrong credentials.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const recoverUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userQuery.setUserState(
            res.locals.user.userID,
            State.ACTIVE
        )
        if (!newUser) return createResponse(res, 400)

        await sendEmailUtil.sendRecoverNotice(newUser)

        res.clearCookie('access_token')
        const token = authJWT.generate({
            userID: newUser.id,
            role: newUser.role,
            state: newUser.state
        })
        res.cookie('access_token', token, {
            expires: new Date(Date.now() + constants.authentication.expires),
            httpOnly: true,
            sameSite: 'lax'
            // secure: true,
            // add secure flag
        })
        return createResponse(res, 200, 'Account is now active.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default { getMe, login, logout, register, deleteUser, recoverUser }
