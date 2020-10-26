namespace OAuth {
    interface EndpointData {
        authorization: string
        token: string
        userInfo: string
    }

    interface TokenData {
        accessToken: string
        refreshToken: string
    }

    interface UserData {
        email: string
    }
}

export = OAuth
