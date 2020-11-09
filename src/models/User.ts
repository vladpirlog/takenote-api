import mongoose, { Schema } from 'mongoose'
import { TokenSchema } from './Token'
import bcrypt from 'bcrypt'
import createID from '../utils/createID.util'
import getUnixTime from '../utils/getUnixTime.util'
import { IUserSchema } from '../types/User'
import OAuthProvider from '../enums/OAuthProvider.enum'
import State from '../enums/State.enum'
import UserRole from '../enums/UserRole.enum'

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

UserSchema.pre<IUserSchema>('save', function (next) {
    if (!this.isOAuthUser()) {
        bcrypt.hash(this.password, 12).then(hash => {
            this.password = hash
            return next()
        })
    } else { return next() }
})

UserSchema.methods.isOAuthUser = function () {
    if (this.oauth && this.oauth.provider) {
        return true
    }
    return false
}

UserSchema.methods.getPublicInfo = function () {
    return Object.freeze({
        id: this.id,
        username: this.username,
        email: this.email,
        state: this.state,
        isOAuthUser: this.isOAuthUser(),
        twoFactorAuth: {
            active: this.twoFactorAuth.active,
            nextCheck: this.twoFactorAuth.nextCheck
        }
    })
}

UserSchema.methods.validPassword = function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

UserSchema.methods.hasConfirmed = function (): boolean {
    return this.state !== 'unconfirmed'
}

UserSchema.methods.isTokenExpired = function (type: 'confirmation' | 'reset') {
    if (type === 'confirmation') {
        if (!this.confirmationToken) return false
        return getUnixTime() > this.confirmationToken.exp
    }
    if (!this.resetToken) return false
    return getUnixTime() > this.resetToken.exp
}

UserSchema.methods.is2faInitialSetup = function (): boolean {
    if (!this.twoFactorAuth.active && this.twoFactorAuth.secret) {
        return true
    }
    return false
}

UserSchema.methods.is2faRequiredOnLogin = function (): boolean {
    return this.twoFactorAuth.active && getUnixTime() > this.twoFactorAuth.nextCheck
}

export default mongoose.model<IUserSchema>('User', UserSchema)
