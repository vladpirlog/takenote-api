import mongoose, { Schema, Document } from 'mongoose'
import { TokenSchema, ITokenSchema } from './Token'
import bcrypt from 'bcrypt'
import createID from '../utils/createID.util'
import getUnixTime from '../utils/getUnixTime.util'
import { OAuthProvider } from '../interfaces/oauth.interface'

export interface IUserSchema extends Document {
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
    isOAuthUser(): boolean
    getPublicInfo(): PublicUserInfo
    hasConfirmed(): boolean
    validPassword(hash: string): Promise<boolean>
    isTokenExpired(type: 'confirmation' | 'reset'): boolean
    is2faInitialSetup(): boolean
    is2faRequired(): boolean
}

export type PublicUserInfo = Pick<IUserSchema, 'id' | 'username' | 'email'>
    & {
        twoFactorAuth: Pick<IUserSchema['twoFactorAuth'], 'active' | 'nextCheck'>,
        isOAuthUser: boolean
    }

export enum UserRole {
    ADMIN = 0,
    SECONDARY_ADMIN = 1,
    USER = 2,
    UNIDENTIFIED = -1,
}

export enum State {
    UNCONFIRMED = 'unconfirmed',
    ACTIVE = 'active',
    DELETING = 'deleting',
}

export const UserSchema = new Schema<IUserSchema>(
    {
        id: {
            type: String,
            required: true,
            default: () => createID('user')
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: false
        },
        state: {
            type: State,
            default: State.UNCONFIRMED,
            required: true
        },
        confirmationToken: {
            type: TokenSchema,
            required: false
        },
        role: {
            type: UserRole,
            default: UserRole.USER,
            required: true
        },
        resetToken: {
            type: TokenSchema,
            required: false
        },
        oauth: {
            provider: {
                type: OAuthProvider,
                required: false
            },
            refreshToken: {
                type: String,
                required: false
            }
        },
        twoFactorAuth: {
            secret: {
                type: String,
                required: false
            },
            active: {
                type: Boolean,
                default: false,
                required: true
            },
            nextCheck: {
                type: Number,
                default: 0,
                required: true
            },
            backupCodes: {
                type: [{
                    id: {
                        type: String,
                        required: true
                    },
                    active: {
                        type: Boolean,
                        required: true,
                        default: true
                    }
                }],
                required: true
            }
        }
    },
    { timestamps: true, writeConcern: { w: 'majority', wtimeout: 1000 }, id: false }
)

UserSchema.pre('save', function (next) {
    if (!(<IUserSchema> this).isOAuthUser()) {
        bcrypt.hash((<IUserSchema> this).password, 12).then(hash => {
            (<IUserSchema> this).password = hash
            return next()
        })
    } else { return next() }
})

/**
 * Returns true if user was created using the OAuth 2.0 flow.
 */
UserSchema.methods.isOAuthUser = function () {
    if (this.oauth && this.oauth.provider) {
        return true
    }
    return false
}

/**
 * Returns public user data that can be viewed by the frontend.
 */
UserSchema.methods.getPublicInfo = function () {
    return {
        id: this.id,
        username: this.username,
        email: this.email,
        isOAuthUser: this.isOAuthUser(),
        twoFactorAuth: {
            active: this.twoFactorAuth.active,
            nextCheck: this.twoFactorAuth.nextCheck
        }
    }
}

/**
 * Checks if the given argument(an unhashed string) matches the user's actual password; returns a boolean
 * @param password an unhashed string
 */
UserSchema.methods.validPassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

/**
 * Checks if the user has confirmed their email address
 */
UserSchema.methods.hasConfirmed = function (): boolean {
    return this.state !== 'unconfirmed'
}

/**
 * Checks if one of the user's tokens has expired
 */
UserSchema.methods.isTokenExpired = function (type: 'confirmation' | 'reset') {
    if (type === 'confirmation') {
        if (!this.confirmationToken) return false
        return getUnixTime() > this.confirmationToken.exp
    }
    if (!this.resetToken) return false
    return getUnixTime() > this.resetToken.exp
}

/**
 * Checks if 2fa setup needs initial code validation
 */
UserSchema.methods.is2faInitialSetup = function (): boolean {
    if (!this.twoFactorAuth.active && this.twoFactorAuth.secret) {
        return true
    }
    return false
}

/**
 * Checks if 2fa verification is required for the login
 */
UserSchema.methods.is2faRequired = function (): boolean {
    return this.twoFactorAuth.active && getUnixTime() > this.twoFactorAuth.nextCheck
}

export default mongoose.model<IUserSchema>('User', UserSchema)
