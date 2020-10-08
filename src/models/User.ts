import mongoose, { Schema, Document } from 'mongoose'
import { Role } from '../interfaces/role.enum'
import { TokenSchema, ITokenSchema } from './Token'
import bcrypt from 'bcrypt'
import { State } from '../interfaces/state.enum'
import createID from '../utils/createID.util'
import getUnixTime from '../utils/getUnixTime.util'
import IPublicUserInfo from '../interfaces/publicUserInfo.interface'
import { OAuthProvider } from '../interfaces/oauth.interface'

export interface IUserSchema extends Document {
    username: string
    email: string
    password: string
    state: State
    confirmationToken: ITokenSchema
    role: Role
    resetToken: ITokenSchema
    oauth?: {
        provider: OAuthProvider
        refreshToken: string
    }
    twoFactorAuth: {
        secret?: string,
        active: boolean,
        nextCheck: number,
        backupCodes: {
            _id: string,
            active: boolean
        }[]
    }
    createdAt: Date
    updatedAt: Date
    isOAuthUser(): boolean
    getPublicUserInfo(): IPublicUserInfo
    hasConfirmed(): boolean
    validPassword(hash: string): Promise<boolean>
    isConfirmationTokenExpired(): boolean
    is2faInitialSetup(): boolean
    is2faRequired(): boolean
}

export const UserSchema = new Schema<IUserSchema>(
    {
        _id: {
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
            type: String,
            default: State.UNCONFIRMED,
            required: true,
            enum: [State.ACTIVE, State.DELETING, State.UNCONFIRMED]
        },
        confirmationToken: {
            type: TokenSchema,
            required: false
        },
        role: {
            type: Number,
            default: Role.USER,
            required: true,
            enum: [
                Role.ADMIN,
                Role.SECONDARY_ADMIN,
                Role.UNIDENTIFIED,
                Role.USER
            ]
        },
        resetToken: {
            type: TokenSchema,
            required: false
        },
        oauth: {
            provider: {
                type: String,
                required: false,
                enum: [OAuthProvider.GOOGLE]
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
                    _id: {
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
    { timestamps: true, writeConcern: { w: 'majority', wtimeout: 1000 } }
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
 * Returns public data that can be viewed by the frontend.
 */
UserSchema.methods.getPublicUserInfo = function () {
    return {
        _id: this._id,
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
 * Checks if the confirmation token has expired
 */
UserSchema.methods.isConfirmationTokenExpired = function (): boolean {
    return getUnixTime() > this.confirmationToken.exp
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
