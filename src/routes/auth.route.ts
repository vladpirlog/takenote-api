import { Router } from 'express'
import authController from '../controllers/auth.controller'
import regexTest from '../middlewares/regexTest.middleware'
import checkUniqueUser from '../middlewares/uniqueUser.middlelware'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import authPasswordController from '../controllers/auth.password.controller'
import authConfirmationController from '../controllers/auth.confirmation.controller'
import validateToken from '../middlewares/validateToken.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import rateLimiting from '../middlewares/rateLimiting.middleware'
import { State } from '../interfaces/state.enum'
import requestFieldsDefined from '../middlewares/requestFieldsDefined.middleware'
import auth2faController from '../controllers/auth.2fa.controller'
import extractUser from '../middlewares/extractUser.middleware'
import { AuthStatus } from '../interfaces/authStatus.enum'
import authOauthController from '../controllers/auth.oauth.controller'

const router = Router()

// Current user handler
router.get('/me', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.getMe)

// Login handler
router.post(
    '/login',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    requestFieldsDefined('body', ['email', 'password']),
    regexTest.login,
    authController.login
)

// Logout handler
router.post('/logout', checkAuthStatus([AuthStatus.LOGGED_IN]), authController.logout)

// Register handler
router.post(
    '/register',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    requestFieldsDefined('body', ['username', 'email', 'password', 'confirm_password']),
    regexTest.register,
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
    requestFieldsDefined('body', ['old_password']),
    regexTest.oldPassword,
    rateLimiting.forEmail,
    authPasswordController.requestResetToken
)

router.post(
    '/rpassword',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    requestFieldsDefined('query', ['token']),
    requestFieldsDefined('body', ['new_password', 'confirm_new_password']),
    regexTest.newPassword,
    validateToken('reset', false),
    authPasswordController.submitResetToken
)

// Password forgot handler
router.post(
    '/forgot_password',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    requestFieldsDefined('body', ['email']),
    regexTest.email,
    rateLimiting.forEmail,
    authPasswordController.requestForgotToken
)

router.post(
    '/fpassword',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    requestFieldsDefined('query', ['token']),
    requestFieldsDefined('body', ['new_password', 'confirm_new_password']),
    regexTest.newPassword,
    validateToken('forgot', false),
    authPasswordController.submitForgotToken
)

// Token validation handler
router.get(
    '/check_token',
    requestFieldsDefined('query', ['token']),
    validateToken('any', true)
)

// Check user existence handler
router.post(
    '/check_credentials',
    checkAuthStatus([AuthStatus.NOT_LOGGED_IN]),
    regexTest.checkCredentials,
    checkUniqueUser(true)
)

// Delete user handler
router.post(
    '/delete',
    checkAuthStatus([AuthStatus.LOGGED_IN]),
    checkUserState([State.ACTIVE, State.UNCONFIRMED]),
    requestFieldsDefined('body', ['old_password']),
    regexTest.oldPassword,
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
