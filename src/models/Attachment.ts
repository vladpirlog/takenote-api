import mongoose, { Schema } from 'mongoose'
import { IAttachmentSchema } from '../types/Attachment'
import createID from '../utils/createID.util'

export const AttachmentSchema = new Schema<IAttachmentSchema>({
    id: {
        type: String,
        required: true,
        default: () => createID('attachment')
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
}, { timestamps: true, id: false })

export default mongoose.model<IAttachmentSchema>('Attachment', AttachmentSchema)
