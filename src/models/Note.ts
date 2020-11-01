import mongoose, { Schema } from 'mongoose'
import { AttachmentSchema } from './Attachment'
import { IUserSchema } from '../types/User'
import createID from '../utils/createID.util'
import { INoteSchema, PublicNoteInfo } from '../types/Note'
import Color from '../enums/Color.enum'
import { CommentSchema } from './Comment'
import { getPermissionsFromRoles, NotePermission, NoteRole } from '../utils/accessManagement.util'

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
        comments: {
            enabled: {
                type: Boolean,
                required: true,
                default: true
            },
            items: {
                type: [CommentSchema],
                required: false
            }
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
            roles: {
                type: [String],
                required: true,
                enum: Object.values(NoteRole)
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

NoteSchema.methods.getPublicInfo = function (userID?: IUserSchema['id'] | 'shared') {
    const owner = this.users.find(u => u.roles.includes(NoteRole.OWNER))
    if (!owner) throw new Error('Note has no owner.')

    const publicNote: PublicNoteInfo = {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        owner: owner.subject
    }

    const user = this.users.find(u => u.subject.id === userID)
    if (!userID || !user) return publicNote

    if (userID === 'shared') {
        publicNote.title = this.title
        publicNote.content = this.content
        return publicNote
    }

    const notePermissions = getPermissionsFromRoles(user.roles)
    if (notePermissions.includes(NotePermission.NOTE_VIEW)) {
        publicNote.title = this.title
        publicNote.content = this.content
        publicNote.archived = user.archived
        publicNote.color = user.color
        publicNote.fixed = user.fixed
        publicNote.tags = user.tags
    }
    if (notePermissions.includes(NotePermission.COMMENT_VIEW)) {
        publicNote.comments = {
            enabled: this.comments.enabled,
            items: this.comments.items.map(c => c.getPublicInfo())
        }
    }
    if (notePermissions.includes(NotePermission.COLLABORATOR_VIEW)) {
        publicNote.collaborators = this.users
            .filter(u => !u.roles.includes(NoteRole.OWNER))
            .map(u => {
                return { subject: u.subject, roles: u.roles }
            })
    }
    if (notePermissions.includes(NotePermission.ATTACHMENT_VIEW)) {
        publicNote.attachments = this.attachments.map(a => a.getPublicInfo())
    }
    if (notePermissions.includes(NotePermission.SHARING_VIEW)) {
        publicNote.share = this.share
    }
    return publicNote
}

export default mongoose.model<INoteSchema>('Note', NoteSchema)
