import { Request, Response, NextFunction } from 'express'
import oauth from '../utils/oauth.util'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import OAuthProvider from '../enums/OAuthProvider.enum'
import AuthStatus from '../enums/AuthStatus.enum'

const google = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query
        const endpoints = await oauth.getEndpoints()
        const tokenData = await oauth.getTokensWithAuthorizationCode(
            code as string, endpoints.token, constants.authentication.oauth.google.redirectURI
        )
        const userData = await oauth.getUserDataWithAccessToken(
            tokenData.accessToken, endpoints.userInfo
        )
        const user = await userQuery.getByEmail(userData.email)
        if (!user) {
            const newUser = await userQuery.createNewOAuthUser({
                email: userData.email,
                oauth: {
                    provider: OAuthProvider.GOOGLE,
                    refreshToken: tokenData.refreshToken
                }
            })
            if (!newUser) return createResponse(res, 400, 'Couldn\'t create user.')

            req.session.authenticationStatus = AuthStatus.LOGGED_IN
            req.session.userID = newUser.id
            req.session.isOAuthUser = true
            req.session.userState = newUser.state
            req.session.userRole = newUser.role
            req.session.userEmail = newUser.email
            return createResponse(res, 201, 'User created successfully.', {
                user: newUser.getPublicInfo()
            })
        }

        req.session.authenticationStatus = AuthStatus.LOGGED_IN
        req.session.userID = user.id
        req.session.isOAuthUser = true
        req.session.userState = user.state
        req.session.userRole = user.role
        req.session.userEmail = user.email
        return createResponse(res, 200, 'Authentication successful.', {
            user: user.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

export default { google }
