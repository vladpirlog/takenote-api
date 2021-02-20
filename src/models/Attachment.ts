import mongoose, { Schema } from 'mongoose'
import { AttachmentType } from '../enums/AttachmentType.enum'
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
    type: {
        type: AttachmentType,
        required: true
    }
}, { timestamps: true, id: false })

AttachmentSchema.methods.getPublicInfo = function () {
    return Object.freeze({
        id: this.id,
        title: this.title,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        url: this.url,
        type: this.type
    })
}

export default mongoose.model<IAttachmentSchema>('Attachment', AttachmentSchema)
