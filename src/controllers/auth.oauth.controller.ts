import { Request, Response, NextFunction } from 'express'
import oauth from '../utils/oauth.util'
import constantsConfig from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import userQuery from '../queries/user.query'
import cookie from '../utils/cookie.util'
import OAuthProvider from '../enums/OAuthProvider.enum'

const google = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query
        const endpoints = await oauth.getEndpoints()
        const tokenData = await oauth.getTokensWithAuthorizationCode(
            code as string, endpoints.token, constantsConfig.authentication.oauth.google.redirectURI
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

            cookie.setAuthCookie(res, newUser)
            return createResponse(res, 201, 'User created successfully.', {
                user: newUser.getPublicInfo()
            })
        }

        cookie.setAuthCookie(res, user)
        return createResponse(res, 200, 'Authentication successful.', {
            user: user.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

export default { google }
