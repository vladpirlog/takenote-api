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

const router = Router()

// Current user handler
router.get('/me', checkAuthStatus(true), authController.getMe)

// Login handler
router.post(
    '/login',
    checkAuthStatus(false),
    requestFieldsDefined('body', ['email', 'password']),
    regexTest.login,
    authController.login
)

// Logout handler
router.post('/logout', checkAuthStatus(true), authController.logout)

// Register handler
router.post(
    '/register',
    checkAuthStatus(false),
    requestFieldsDefined('body', ['username', 'email', 'password', 'confirm_password']),
    regexTest.register,
    checkUniqueUser(false),
    rateLimiting.forEmail,
    authController.register
)

// Confirmation handler
router.post(
    '/request_confirmation',
    checkAuthStatus(true),
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
    checkAuthStatus(true),
    requestFieldsDefined('body', ['old_password']),
    regexTest.oldPassword,
    rateLimiting.forEmail,
    authPasswordController.requestResetToken
)

router.post(
    '/rpassword',
    checkAuthStatus(true),
    requestFieldsDefined('query', ['token']),
    requestFieldsDefined('body', ['new_password', 'confirm_new_password']),
    regexTest.newPassword,
    validateToken('reset', false),
    authPasswordController.submitResetToken
)

// Password forgot handler
router.post(
    '/forgot_password',
    checkAuthStatus(false),
    requestFieldsDefined('body', ['email']),
    regexTest.email,
    rateLimiting.forEmail,
    authPasswordController.requestForgotToken
)

router.post(
    '/fpassword',
    checkAuthStatus(false),
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
    checkAuthStatus(false),
    regexTest.checkCredentials,
    checkUniqueUser(true)
)

// Delete user handler
router.post(
    '/delete',
    checkAuthStatus(true),
    checkUserState([State.ACTIVE, State.UNCONFIRMED]),
    requestFieldsDefined('body', ['old_password']),
    regexTest.oldPassword,
    authController.deleteUser
)

// Recover user handler
router.post(
    '/recover',
    checkAuthStatus(true),
    checkUserState([State.DELETING]),
    authController.recoverUser
)

export default router
