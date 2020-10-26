import constants from '../config/constants.config'
import { IOAuthEndpointData, IOAuthTokenData, IOAuthUserData } from '../types/OAuth'
import querystring from 'querystring'
import axios from 'axios'

const getEndpoints = async (): Promise<IOAuthEndpointData> => {
    try {
        const res = await axios.get(constants.authentication.oauth.google.discoveryDocument)
        return {
            authorization: res.data.authorization_endpoint,
            token: res.data.token_endpoint,
            userInfo: res.data.userinfo_endpoint
        }
    } catch (err) { return err.data.error }
}

const getTokensWithAuthorizationCode = async (
    authorizationCode: string,
    tokenURL: string,
    redirectURI: string
): Promise<IOAuthTokenData> => {
    try {
        const body = querystring.stringify({
            code: authorizationCode,
            redirect_uri: redirectURI,
            client_id: constants.authentication.oauth.google.clientID,
            client_secret: constants.authentication.oauth.google.clientSecret,
            grant_type: 'authorization_code',
            scope: ''
        })
        const res = await axios.post(tokenURL, body)
        return {
            accessToken: res.data.access_token,
            refreshToken: res.data.refresh_token
        }
    } catch (err) { return err.data.error }
}

const getUserDataWithAccessToken = async (
    accessToken: string,
    userInfoURL: string
): Promise<IOAuthUserData> => {
    try {
        const res = await axios.post(userInfoURL, null, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        return {
            email: res.data.email
        }
    } catch (err) { return err.data.error }
}

export default { getEndpoints, getTokensWithAuthorizationCode, getUserDataWithAccessToken }
