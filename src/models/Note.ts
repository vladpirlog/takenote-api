import mongoose, { Schema, Document } from 'mongoose'
import { AttachmentSchema, IAttachmentSchema } from './Attachment'
import { PermissionSchema, IPermissionSchema } from './Permission'
import { Color } from '../interfaces/color.enum'
import { IUserSchema } from './User'
import createID from '../utils/createID.util'

export interface INoteSchema extends Document {
    title: string
    content: string
    owner: IUserSchema['_id']
    permissions: IPermissionSchema[]
    attachments: IAttachmentSchema[]
    tags: string[]
    share: { code: string, active: boolean }
    createdAt: Date
    updatedAt: Date
    archived: boolean
    color: Color
    getShareURL(): string
}

export interface INoteBody {
    title?: INoteSchema['title']
    content?: INoteSchema['content']
    archived?: INoteSchema['archived']
    color?: INoteSchema['color']
    share?: INoteSchema['share']
}

export const NoteSchema: Schema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            default: () => createID('note')
        },
        title: {
            type: String,
            required: false,
            default: ''
        },
        content: {
            type: String,
            required: false,
            default: ''
        },
        owner: {
            type: String,
            required: true,
            ref: 'User'
        },
        attachments: {
            type: [AttachmentSchema],
            required: false
        },
        tags: {
            type: [String],
            required: false
        },
        permissions: {
            type: [PermissionSchema],
            required: false
        },
        share: {
            code: {
                type: String,
                required: false
            },
            active: {
                type: Boolean,
                default: false,
                required: true
            }
        },
        color: {
            type: String,
            default: Color.grey,
            required: true
        },
        archived: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    { timestamps: true }
)

/**
 * Returns the full path to a shared note, using the share code.
 */
NoteSchema.methods.getShareURL = function () {
    return `/shared/${this.share.code}`
}

export default mongoose.model<INoteSchema>('Note', NoteSchema)
