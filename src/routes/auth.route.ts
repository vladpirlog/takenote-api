import { Router } from 'express'
import authController from '../controllers/auth.controller'
import {
    validateCheckCredentialsBody,
    validateLoginBody,
    validateOldPasswordBody,
    validateRegisterBody,
    validateEmailBody,
    validateNewPasswordBody
} from '../middlewares/bodyValidation.middleware'
import checkUniqueUser from '../middlewares/uniqueUser.middlelware'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import authPasswordController from '../controllers/auth.password.controller'
import authConfirmationController from '../controllers/auth.confirmation.controller'
import validateToken from '../middlewares/validateToken.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import rateLimiting from '../middlewares/rateLimiting.middleware'
import requestFieldsDefined from '../middlewares/requestFieldsDefined.middleware'
import auth2faController from '../controllers/auth.2fa.controller'
import extractUser from '../middlewares/extractUser.middleware'
import { AuthStatus } from '../interfaces/authStatus.enum'
import authOauthController from '../controllers/auth.oauth.controller'
import recaptcha from '../middlewares/recaptcha.middleware'
import { State } from '../models/User'

const router = Router()

// Current user handler
router.get('/me', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.getMe)

// Login handler
router.post(
    '/login',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateLoginBody,
    recaptcha,
    authController.login
)

// Logout handler
router.post('/logout', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.logout)

// Register handler
router.post(
    '/register',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateRegisterBody,
    recaptcha,
    checkUniqueUser(false),
    rateLimiting.forEmail,
    authController.register
)

// Confirmation handler
router.post(
    '/request_confirmation',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserState([State.UNCONFIRMED]),
    rateLimiting.forEmail,
    authConfirmationController.requestConfirmationToken
)

router.post(
    '/confirm',
    requestFieldsDefined('query', ['token']),
    authConfirmationController.confirm
)

// Password reset handler
router.post(
    '/reset_password',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    validateOldPasswordBody,
    rateLimiting.forEmail,
    authPasswordController.requestResetTokenWithPassword
)

// Password forgot handler
router.post(
    '/forgot_password',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateEmailBody,
    rateLimiting.forEmail,
    authPasswordController.requestResetTokenWithEmail
)

// New password submition handler
router.post(
    '/new_password',
    requestFieldsDefined('query', ['token']),
    validateNewPasswordBody,
    recaptcha,
    authPasswordController.submitToken
)

// Token validation handler
router.get(
    '/check_token',
    requestFieldsDefined('query', ['token']),
    validateToken
)

// Check user existence handler
router.post(
    '/check_credentials',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateCheckCredentialsBody,
    checkUniqueUser(true)
)

// Delete user handler
router.post(
    '/delete',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserState([State.ACTIVE, State.UNCONFIRMED]),
    validateOldPasswordBody,
    authController.deleteUser
)

// Recover user handler
router.post(
    '/recover',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserState([State.DELETING]),
    authController.recoverUser
)

// Two factor authentication handler
router.post(
    '/2fa',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    auth2faController.generate2faSecret
)

router.post(
    '/2fa/verify',
    extractUser.fromTfaTempCookie,
    checkAuthStatus([AuthStatus.LOGGED_IN, AuthStatus.TFA_LOGGED_IN]),
    requestFieldsDefined('query', ['code']),
    auth2faController.verify2faCode
)

router.delete(
    '/2fa',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    requestFieldsDefined('query', ['code']),
    auth2faController.disable2fa
)

// Google OAuth handler
router.get(
    '/google',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    requestFieldsDefined('query', ['code']),
    authOauthController.google
)

export default router
