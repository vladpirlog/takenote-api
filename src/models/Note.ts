import mongoose, { Schema } from 'mongoose'
import { AttachmentSchema } from './Attachment'
import { IUserSchema } from '../types/User'
import createID from '../utils/createID.util'
import { INoteSchema } from '../types/Note'
import Color from '../enums/Color.enum'
import NoteRole from '../enums/NoteRole.enum'

export const NoteSchema = new Schema<INoteSchema>(
    {
        id: {
            type: String,
            required: true,
            default: () => createID('note')
        },
        title: {
            type: String,
            required: false
        },
        content: {
            type: String,
            required: false
        },
        attachments: {
            type: [AttachmentSchema],
            required: false
        },
        users: [{
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
            role: {
                type: NoteRole,
                required: true
            },
            tags: {
                type: [String],
                required: false
            },
            color: {
                type: Color,
                default: Color.DEFAULT,
                required: true
            },
            archived: {
                type: Boolean,
                default: false,
                required: true
            },
            fixed: {
                type: Boolean,
                default: false,
                required: true
            }
        }],
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
        }
    },
    { timestamps: true, id: false }
)

NoteSchema.methods.getPublicInfo = function (userID?: IUserSchema['id']) {
    const owner = this.users.find(u => u.role === 'owner')
    if (!owner) throw new Error('Note has no owner.')

    const user = this.users.find(u => u.subject.id === userID)
    if (!userID || !user) {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            attachments: this.attachments,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            share: this.share,
            owner: owner.subject
        }
    }
    return {
        id: this.id,
        title: this.title,
        content: this.content,
        attachments: this.attachments,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        share: this.share,
        owner: owner.subject,
        archived: user.archived,
        color: user.color,
        fixed: user.fixed,
        tags: user.tags,
        collaborators: owner.subject.id === user.subject.id
            ? this.users.filter(u => u.role !== 'owner').map(u => {
                return { subject: u.subject, role: u.role }
            })
            : [{ subject: user.subject, role: user.role }]
    }
}

export default mongoose.model<INoteSchema>('Note', NoteSchema)
