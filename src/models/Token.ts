import mongoose, { Schema, Document } from 'mongoose'

/**
 * Schema describing a token(can be of type reset or confirmation).
 */
export interface ITokenSchema extends Document {
    exp: number
}

export const TokenSchema: Schema = new Schema({
    _id: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        required: true
    }
})

export default mongoose.model<ITokenSchema>('Token', TokenSchema)
