import mongoose, { Schema, Document } from 'mongoose'

/**
 * Schema describing a token(can be of type reset, forgot or confirmation).
 */
export interface ITokenSchema extends Document {
    token: string;
    exp: number;
}

export const TokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        required: true
    }
})

export default mongoose.model<ITokenSchema>('Token', TokenSchema)
