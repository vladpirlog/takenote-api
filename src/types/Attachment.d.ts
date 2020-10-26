import { Document } from 'mongoose'

export interface IAttachmentSchema extends Document {
    /** ID of the attachment */
    id: string
    url: string
    title: string
    description: string
}
