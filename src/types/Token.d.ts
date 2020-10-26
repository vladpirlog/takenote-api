import { Document } from 'mongoose'

export interface ITokenSchema extends Document {
    /** ID of the token */
    id: string
    exp: number
}
