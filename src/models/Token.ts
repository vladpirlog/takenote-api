import mongoose, { Schema, Document } from 'mongoose'

/**
 * Schema describing a token (can be of type reset or confirmation).
 */
export interface ITokenSchema extends Document {
    id: string
    exp: number
}

export const TokenSchema = new Schema<ITokenSchema>({
    id: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        required: true
    }
}, { timestamps: true, id: false })

export default mongoose.model<ITokenSchema>('Token', TokenSchema)
