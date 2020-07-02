import mongoose, { Schema, Document } from 'mongoose'

/**
 * Schema describing an attachment, containing the URL of the image, and optionally a title and a description.
 */
export interface IAttachmentSchema extends Document {
  url: string;
  title: string;
  description: string;
}

export const AttachmentSchema: Schema = new Schema({
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
})

export default mongoose.model<IAttachmentSchema>('Attachment', AttachmentSchema)
