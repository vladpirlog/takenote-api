import mongoose, { Schema } from 'mongoose'
import { ICommentSchema } from '../types/Comment'
import createID from '../utils/createID.util'

export const CommentSchema = new Schema<ICommentSchema>({
    id: {
        type: String,
        required: true,
        default: () => createID('comment')
    },
    subject: {
        id: {
            type: String,
            required: true,
            ref: 'User'
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true, id: false })

CommentSchema.methods.getPublicInfo = function () {
    return Object.freeze({
        id: this.id,
        subject: this.subject,
        text: this.text,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    })
}

export default mongoose.model<ICommentSchema>('Comment', CommentSchema)
