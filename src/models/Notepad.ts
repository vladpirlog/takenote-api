import { Response } from 'express'
import mongoose, { Schema } from 'mongoose'
import { Permission } from '../enums/Permission.enum'
import { Role } from '../enums/Role.enum'
import { INotepadSchema, PublicNotepadInfo } from '../types/Notepad'
import { getPermissionsFromRoles } from '../utils/accessManagement.util'
import createID from '../utils/createID.util'
import getAuthUser from '../utils/getAuthUser.util'

const NotepadSchema = new Schema<INotepadSchema>(
    {
        id: {
            type: String,
            required: true,
            default: () => createID('notepad')
        },
        title: {
            type: String,
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
        }
    },
    { timestamps: true, id: false }
)

NotepadSchema.methods.getPublicInfo = function (
    res: Response,
    isShared: boolean = false
) {
    const ownerData = Array
        .from(this.users.values())
        .find(val => val.roles.includes(Role.OWNER))
    if (!ownerData) throw new Error('Notepad has no owner.')

    const publicNotepad: PublicNotepadInfo = {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        owner: ownerData.subject
    }

    if (isShared) {
        publicNotepad.title = this.title
        return publicNotepad
    }

    const userData = this.users.get(getAuthUser(res).id)
    if (!userData) throw new Error()

    const permissionsHeldByUser = getPermissionsFromRoles('notepad', userData.roles)

    if (permissionsHeldByUser.includes(Permission.NOTEPAD_VIEW)) {
        publicNotepad.title = this.title
    }
    if (permissionsHeldByUser.includes(Permission.NOTEPAD_SHARING_VIEW)) {
        publicNotepad.share = this.share
    }
    if (permissionsHeldByUser.includes(Permission.NOTEPAD_COLLABORATOR_VIEW)) {
        publicNotepad.collaborators = Array.from(this.users.values())
            .filter(val => !val.roles.includes(Role.OWNER))
            .map(val => ({ subject: val.subject, roles: val.roles }))
    }
    return Object.freeze(publicNotepad)
}

export default mongoose.model<INotepadSchema>('Notepad', NotepadSchema)
