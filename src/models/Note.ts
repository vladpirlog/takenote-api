import mongoose, { Schema } from 'mongoose'
import { AttachmentSchema } from './Attachment'
import createID from '../utils/createID.util'
import { INoteSchema, PublicNoteInfo } from '../types/Note'
import Color from '../enums/Color.enum'
import { CommentSchema } from './Comment'
import { Permission } from '../enums/Permission.enum'
import { Response } from 'express'
import getAuthUser from '../utils/getAuthUser.util'
import { Role } from '../enums/Role.enum'
import { getPermissionsFromRoles } from '../utils/accessManagement.util'
import { DrawingSchema } from './Drawing'

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
    res: Response,
    isShared: boolean = false
) {
    const ownerData = Array
        .from(this.users.values())
        .find(val => val.roles.includes(Role.OWNER))
    if (!ownerData) throw new Error('Note has no owner.')

    const publicNote: PublicNoteInfo = {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        owner: ownerData.subject
    }

    if (isShared) {
        publicNote.title = this.title
        publicNote.content = this.content
        return publicNote
    }

    const userData = this.users.get(getAuthUser(res).id)

    if (!userData) throw new Error()
    const permissionsHeldByUser = getPermissionsFromRoles('note', userData.roles)

    const canViewNote = permissionsHeldByUser.includes(Permission.NOTE_VIEW)
    if (canViewNote) {
        publicNote.title = this.title
        publicNote.content = this.content
        publicNote.archived = userData.archived
        publicNote.color = userData.color
        publicNote.fixed = userData.fixed
        publicNote.tags = userData.tags
    }

    const canViewComments = permissionsHeldByUser.includes(Permission.NOTE_COMMENT_VIEW)
    if (canViewComments) {
        publicNote.comments = {
            enabled: this.comments.enabled,
            items: this.comments.items.map(c => c.getPublicInfo())
        }
    }

    const canViewCollaborators = permissionsHeldByUser.includes(Permission.NOTE_COLLABORATOR_VIEW) && !this.notepadID
    if (canViewCollaborators) {
        publicNote.collaborators = Array.from(this.users.values())
            .filter(val => !val.roles.includes(Role.OWNER))
            .map(val => ({ subject: val.subject, roles: val.roles }))
    }

    const canViewAttachments = permissionsHeldByUser.includes(Permission.NOTE_ATTACHMENT_VIEW)
    if (canViewAttachments) {
        publicNote.attachments = this.attachments.map(a => a.getPublicInfo())
    }

    const canViewDrawings = permissionsHeldByUser.includes(Permission.NOTE_DRAWING_VIEW)
    if (canViewDrawings) {
        publicNote.drawings = this.drawings.map(d => d.getPublicInfo())
    }

    const canViewSharing = permissionsHeldByUser.includes(Permission.NOTE_SHARING_VIEW) && !this.notepadID
    if (canViewSharing) {
        publicNote.share = this.share
    }
    return Object.freeze(publicNote)
}

export default mongoose.model<INoteSchema>('Note', NoteSchema)
