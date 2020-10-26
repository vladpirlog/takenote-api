export interface IOAuthEndpointData {
    authorization: string
    token: string
    userInfo: string
}

export interface IOAuthTokenData {
    accessToken: string
    refreshToken: string
}

export interface IOAuthUserData {
    email: string
}

export enum OAuthProvider {
    GOOGLE = 'google'
}
