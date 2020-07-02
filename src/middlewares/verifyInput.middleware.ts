import { Request, Response, NextFunction } from 'express'
import checkRegex from '../utils/checkRegex.util'
import constants from '../config/constants'
import createResponse from '../utils/createResponse.util'

/**
 * Middleware function that tests the email/username and password against the RegExp
 */
const login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    if (
        (!checkRegex(constants.regex.email, email) &&
            !checkRegex(constants.regex.username, email)) ||
        !checkRegex(constants.regex.password, password)
    ) { return createResponse(res, 422, 'Credentials invalid.') }
    return next()
}

/**
 * Middleware function that tests the email, username and password against the RegExp
 */
const register = (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, confirm_password: confirmPassword } = req.body

    if (!checkRegex(constants.regex.username, username)) {
        return createResponse(res, 422, 'Username invalid.')
    }
    if (!checkRegex(constants.regex.email, email)) {
        return createResponse(res, 422, 'Email invalid.')
    }
    if (!checkRegex(constants.regex.password, [password, confirmPassword])) {
        return createResponse(res, 422, 'Password invalid.')
    }
    if (password !== confirmPassword) {
        return createResponse(res, 422, 'Passwords do not match.')
    }
    return next()
}

/**
 * Middleware function that tests the new password against the RegExp (when resetting the pw)
 */
const newPassword = (req: Request, res: Response, next: NextFunction) => {
    const { new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body

    if (
        !checkRegex(constants.regex.password, [
            newPassword,
            confirmNewPassword
        ])
    ) {
        return createResponse(res, 422, 'Password invalid.')
    }
    if (newPassword !== confirmNewPassword) {
        return createResponse(res, 422, 'Passwords do not match.')
    }
    return next()
}

/**
 * Middleware function that tests the old password against the RegExp (when requesting a pw change)
 */
const oldPassword = (req: Request, res: Response, next: NextFunction) => {
    const { old_password: oldPassword } = req.body

    if (!checkRegex(constants.regex.password, oldPassword)) {
        return createResponse(res, 422, 'Password invalid.')
    }
    return next()
}

/**
 * Middleware function that tests the email/username against the RegExp (when user forgets the pw)
 */
const email = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body

    if (
        !checkRegex(constants.regex.email, email) &&
        !checkRegex(constants.regex.username, email)
    ) { return createResponse(res, 422, 'Email/username invalid.') }
    return next()
}

export default { login, register, newPassword, oldPassword, email }
