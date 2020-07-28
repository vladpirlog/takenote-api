import { Router } from 'express'
import authController from '../controllers/auth.controller'
import verifyInput from '../middlewares/verifyInput.middleware'
import checkUniqueUser from '../middlewares/uniqueUser.middlelware'
import checkAuthStatus from '../middlewares/checkAuthStatus.middleware'
import checkBody from '../middlewares/checkBody.middleware'
import checkQuery from '../middlewares/checkQuery.middleware'
import authPasswordController from '../controllers/auth.password.controller'
import checkQueryNotArray from '../middlewares/checkQueryNotArray.middleware'
import authConfirmationController from '../controllers/auth.confirmation.controller'
import validateToken from '../middlewares/validateToken.middleware'
import checkUserState from '../middlewares/checkUserState.middleware'
import rateLimiting from '../middlewares/rateLimiting.middleware'
import { State } from '../interfaces/state.enum'

const router = Router()

// Current user handler
router.get('/me', checkAuthStatus(true), authController.getMe)

// Login handler
router.post(
    '/login',
    checkAuthStatus(false),
    checkBody(['email', 'password']),
    verifyInput.login,
    authController.login
)

// Logout handler
router.post('/logout', checkAuthStatus(true), authController.logout)

// Register handler
router.post(
    '/register',
    checkAuthStatus(false),
    checkBody(['username', 'email', 'password', 'confirm_password']),
    verifyInput.register,
    checkUniqueUser,
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
    checkQuery(['token']),
    checkQueryNotArray(['token']),
    authConfirmationController.confirm
)

// Password reset handler
router.post(
    '/reset_password',
    checkAuthStatus(true),
    checkBody(['old_password']),
    verifyInput.oldPassword,
    rateLimiting.forEmail,
    authPasswordController.requestResetToken
)

router.post(
    '/rpassword',
    checkAuthStatus(true),
    checkQuery(['token']),
    checkQueryNotArray(['token']),
    checkBody(['new_password', 'confirm_new_password']),
    verifyInput.newPassword,
    validateToken('reset', false),
    authPasswordController.submitResetToken
)

// Password forgot handler
router.post(
    '/forgot_password',
    checkAuthStatus(false),
    checkBody(['email']),
    verifyInput.email,
    rateLimiting.forEmail,
    authPasswordController.requestForgotToken
)

router.post(
    '/fpassword',
    checkAuthStatus(false),
    checkQuery(['token']),
    checkQueryNotArray(['token']),
    checkBody(['new_password', 'confirm_new_password']),
    verifyInput.newPassword,
    validateToken('forgot', false),
    authPasswordController.submitForgotToken
)

// Token validation handler
router.get(
    '/check_token',
    checkQuery(['token']),
    checkQueryNotArray(['token']),
    validateToken('any', true)
)

// Delete user handler
router.post(
    '/delete',
    checkAuthStatus(true),
    checkUserState([State.ACTIVE, State.UNCONFIRMED]),
    checkBody(['old_password']),
    verifyInput.oldPassword,
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
