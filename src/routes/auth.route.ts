import { Router } from 'express'
import authController from '../controllers/auth.controller'
import checkUniqueUser from '../middlewares/uniqueUser.middleware'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import authPasswordController from '../controllers/auth.password.controller'
import authConfirmationController from '../controllers/auth.confirmation.controller'
import checkUserState from '../middlewares/checkUserState.middleware'
import rateLimiting from '../middlewares/rateLimiting.middleware'
import auth2faController from '../controllers/auth.2fa.controller'
import extractUser from '../middlewares/extractUser.middleware'
import authOauthController from '../controllers/auth.oauth.controller'
import recaptcha from '../middlewares/recaptcha.middleware'
import State from '../enums/State.enum'
import AuthStatus from '../enums/AuthStatus.enum'
import checkTokenExpiration from '../middlewares/checkTokenExpiration.middleware'
import { validateBody, validateQuery } from '../middlewares/requestValidation.middleware'

const router = Router()

// Current user handler
router.get('/me', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.getMe)

// Login handler
router.post(
    '/login',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateBody('login', 'Credentials invalid.'),
    recaptcha,
    authController.login
)

// Logout handler
router.post('/logout', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.logout)

// Register handler
router.post(
    '/register',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateBody('register', 'Credentials invalid.'),
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
    validateQuery('confirmationToken', 'Token invalid.'),
    authConfirmationController.confirm
)

// Password reset handler
router.post(
    '/reset_password',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    validateBody('oldPassword', 'Credentials invalid.'),
    rateLimiting.forEmail,
    authPasswordController.requestResetTokenWithPassword
)

// Password forgot handler
router.post(
    '/forgot_password',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateBody('email', 'Credentials invalid.'),
    rateLimiting.forEmail,
    authPasswordController.requestResetTokenWithEmail
)

// New password submition handler
router.post(
    '/new_password',
    validateQuery('resetToken', 'Token invalid.'),
    validateBody('newPassword', 'Credentials invalid.'),
    recaptcha,
    authPasswordController.submitToken
)

// Token validation handler
router.get(
    '/check_token',
    validateQuery('resetOrConfirmationToken', 'Token invalid.'),
    checkTokenExpiration
)

// Check user existence handler
router.post(
    '/check_credentials',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateBody('email', 'Credentials invalid.'),
    checkUniqueUser(true)
)

// Delete user handler
router.post(
    '/delete',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserState([State.ACTIVE, State.UNCONFIRMED]),
    validateBody('oldPassword', 'Credentials invalid.'),
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
    validateQuery('tfa', 'Code invalid.'),
    auth2faController.verify2faCode
)

router.delete(
    '/2fa',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    validateQuery('tfa', 'Code invalid.'),
    auth2faController.disable2fa
)

// Google OAuth handler
router.get(
    '/google',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    validateQuery('googleOauth', 'Code invalid.'),
    authOauthController.google
)

export default router
