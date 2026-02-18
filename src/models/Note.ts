import mongoose, { Schema } from 'mongoose'
import { AttachmentSchema } from './Attachment'
import createID from '../utils/createID.util'
import { INoteSchema, PublicNoteInfo } from '../types/Note'
import Color from '../enums/Color.enum'
import { CommentSchema } from './Comment'
import { Permission } from '../enums/Permission.enum'
import { Role } from '../enums/Role.enum'
import { getPermissionsFromRoles } from '../utils/accessManagement.util'
import { DrawingSchema } from './Drawing'
import { IUserSchema } from '../types/User'

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
        drawings: {
            type: [DrawingSchema],
            required: false
        },
        users: {
            type: Map,
            of: {
                subject: {
                    id: {
                        type: String,
                        required: true,
                        ref: 'User'
                    },
                    email: {
                        type: String,
                        required: true
                    }
                },
                roles: {
                    type: [String],
                    required: true,
                    enum: Object.values(Role)
                },
                tags: {
                    type: [String],
                    required: false,
                    default: []
                },
                color: {
                    type: Color,
                    default: Color.DEFAULT
                },
                archived: {
                    type: Boolean,
                    default: false
                },
                fixed: {
                    type: Boolean,
                    default: false
                }
            }
        },
        share: {
            code: {
                type: String,
                required: false
            },
            active: {
                type: Boolean,
                default: false
            }
        },
        notepadID: {
            type: String,
            default: '',
            ref: 'Notepad'
        }
    },
    { timestamps: true, id: false }
)

NoteSchema.methods.getPublicInfo = function (
    userID?: IUserSchema['id']
) {
    const thisObj = this as INoteSchema

    const ownerData = Array
        .from(thisObj.users.values())
        .find(val => val.roles.includes(Role.OWNER))
    if (!ownerData) throw new Error('Note has no owner.')

    const publicNote: PublicNoteInfo = {
        id: thisObj.id,
        createdAt: thisObj.createdAt,
        updatedAt: thisObj.updatedAt,
        owner: ownerData.subject
    }

    if (!userID) {
        publicNote.title = thisObj.title
        publicNote.content = thisObj.content
        return publicNote
    }

    const userData = thisObj.users.get(userID)

    if (!userData) throw new Error()
    const permissionsHeldByUser = getPermissionsFromRoles('note', userData.roles)

    const canViewNote = permissionsHeldByUser.includes(Permission.NOTE_VIEW)
    if (canViewNote) {
        publicNote.title = thisObj.title
        publicNote.content = thisObj.content
        publicNote.archived = userData.archived
        publicNote.color = userData.color
        publicNote.fixed = userData.fixed
        publicNote.tags = userData.tags
        publicNote.comments = {
            enabled: thisObj.comments.enabled,
            items: thisObj.comments.items.map(c => c.getPublicInfo())
        }
        publicNote.attachments = thisObj.attachments.map(a => a.getPublicInfo())
        publicNote.drawings = thisObj.drawings.map(d => d.getPublicInfo())
        if (!thisObj.notepadID) {
            publicNote.collaborators = Array.from(thisObj.users.values())
                .filter(val => !val.roles.includes(Role.OWNER))
                .map(val => ({ subject: val.subject, roles: val.roles }))
            publicNote.share = thisObj.share
        }
    }
    return Object.freeze(publicNote)
}

export default mongoose.model<INoteSchema>('Note', NoteSchema)
