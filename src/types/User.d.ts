import { Document } from 'mongoose'
import OAuthProvider from '../enums/OAuthProvider.enum'
import State from '../enums/State.enum'
import UserRole from '../enums/UserRole.enum'
import { ITokenSchema } from './Token'

export interface IUserSchema extends Document {
    /** ID of the user */
    id: string
    username: string
    email: string
    password: string
    state: State
    confirmationToken?: ITokenSchema
    role: UserRole
    resetToken?: ITokenSchema
    oauth?: {
        provider: OAuthProvider
        refreshToken: string
    }
    twoFactorAuth: {
        secret?: string,
        active: boolean,
        nextCheck: number,
        backupCodes: {
            id: string,
            active: boolean
        }[]
    }
    createdAt: Date
    updatedAt: Date

    /**
     * Returns true if user was created using the OAuth 2.0 flow.
     */
    isOAuthUser(): boolean

    /**
     * Returns public user data that can be viewed by the frontend.
     */
    getPublicInfo(): PublicUserInfo

    /**
     * Checks if the user has confirmed their email address
     */
    hasConfirmed(): boolean

    /**
     * Checks if the given argument(an unhashed string) matches the user's actual password; returns a boolean
     * @param password an unhashed string
     */
    validPassword(password: string): Promise<boolean>

    /**
     * Checks if one of the user's tokens has expired
     * @param type the type of token to be checked
     */
    isTokenExpired(type: 'confirmation' | 'reset'): boolean

    /**
     * Checks if 2fa setup needs initial code validation
     */
    is2faInitialSetup(): boolean

    /**
     * Checks if 2fa verification is required for the login
     */
    is2faRequiredOnLogin(): boolean
}

export type PublicUserInfo = Pick<IUserSchema, 'id' | 'username' | 'email' | 'state'>
    & {
        twoFactorAuth: Pick<IUserSchema['twoFactorAuth'], 'active' | 'nextCheck'>,
        isOAuthUser: boolean
    }

export type AuthenticatedUserInfo = Pick<IUserSchema, 'id' | 'role' | 'state'>

export interface DecodedJWT {
    jti: string
    sub: IUserSchema['id']
    _info: IUserSchema['role']
    _state: IUserSchema['state']
    exp: number
}
