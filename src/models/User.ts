import mongoose, { Schema, Document } from 'mongoose'
import { Role } from '../interfaces/role.enum'
import { v4 as uuidv4 } from 'uuid'
import { TokenSchema, ITokenSchema } from './Token'
import bcrypt from 'bcrypt'
import { State } from '../interfaces/state.enum'

export interface IUserSchema extends Document {
    username: string;
    email: string;
    password: string;
    salt: string;
    state: State;
    confirmationToken: ITokenSchema;
    role: Role;
    resetToken: ITokenSchema;
    forgotToken: ITokenSchema;
    createdAt: Date;
    updatedAt: Date;
    hasConfirmed(): boolean;
    validPassword(hash: string): boolean;
}

export const UserSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            default: uuidv4
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
            default: Role.user,
            required: true,
            enum: [
                Role.admin,
                Role.secondaryAdmin,
                Role.unidentified,
                Role.user
            ]
        },
        resetToken: {
            type: TokenSchema,
            required: false
        },
        forgotToken: {
            type: TokenSchema,
            required: false
        }
    },
    { timestamps: true }
)

UserSchema.pre('save', function (next) {
    const salt = bcrypt.genSaltSync(12)
    const hash = bcrypt.hashSync((<any> this).password, salt);
    (<any> this).password = hash;
    (<any> this).salt = salt
    next()
})

/**
 * A function that checks if the given argument(an unhashed string) matches the user's actual password; returns a boolean
 * @param password an unhashed string
 */
UserSchema.methods.validPassword = function (password: string): boolean {
    return this.password === bcrypt.hashSync(password, this.salt)
}

/**
 * A function that checks if the user has confirmed their email address
 */
UserSchema.methods.hasConfirmed = function (): boolean {
    return this.status !== 'unconfirmed'
}

export default mongoose.model<IUserSchema>('User', UserSchema)
