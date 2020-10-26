import mongoose, { Schema } from 'mongoose'
import { ITokenSchema } from '../types/Token'

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
