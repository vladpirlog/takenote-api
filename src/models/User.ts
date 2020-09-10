import mongoose, { Schema, Document } from 'mongoose'
import { Role } from '../interfaces/role.enum'
import { TokenSchema, ITokenSchema } from './Token'
import bcrypt from 'bcrypt'
import { State } from '../interfaces/state.enum'
import createID from '../utils/createID.util'
import getUnixTime from '../utils/getUnixTime.util'
import IPublicUserInfo from '../interfaces/publicUserInfo.interface'

export interface IUserSchema extends Document {
    username: string
    email: string
    password: string
    salt: string
    state: State
    confirmationToken: ITokenSchema
    role: Role
    resetToken: ITokenSchema
    forgotToken: ITokenSchema
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
    getPublicUserInfo(): IPublicUserInfo
    hasConfirmed(): boolean
    validPassword(hash: string): boolean
    isConfirmationTokenExpired(): boolean
    is2faInitialSetup(): boolean
    is2faRequired(): boolean
}

export const UserSchema: Schema = new Schema(
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
            required: true
        },
        salt: {
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
        forgotToken: {
            type: TokenSchema,
            required: false
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
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync((<any> this).password, salt);
    (<any> this).password = hash;
    (<any> this).salt = salt
    next()
})

/**
 * Returns public data that can be viewed by the frontend.
 */
UserSchema.methods.getPublicUserInfo = function () {
    return {
        _id: this._id,
        username: this.username,
        email: this.email,
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
UserSchema.methods.validPassword = function (password: string): boolean {
    return this.password === bcrypt.hashSync(password, this.salt)
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
    return !this.twoFactorAuth.active && this.twoFactorAuth.secret
}

/**
 * Checks if 2fa verification is required for the login
 */
UserSchema.methods.is2faRequired = function (): boolean {
    return this.twoFactorAuth.active && getUnixTime() > this.twoFactorAuth.nextCheck
}

export default mongoose.model<IUserSchema>('User', UserSchema)
