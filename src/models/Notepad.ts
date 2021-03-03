import mongoose, { Schema } from 'mongoose'
import { Permission } from '../enums/Permission.enum'
import { Role } from '../enums/Role.enum'
import { INotepadSchema, PublicNotepadInfo } from '../types/Notepad'
import { IUserSchema } from '../types/User'
import { getPermissionsFromRoles } from '../utils/accessManagement.util'
import createID from '../utils/createID.util'

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
    userID?: IUserSchema['id']
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

    if (!userID) {
        publicNotepad.title = this.title
        return publicNotepad
    }

    const userData = this.users.get(userID)
    if (!userData) throw new Error()

    const permissionsHeldByUser = getPermissionsFromRoles('notepad', userData.roles)

    if (permissionsHeldByUser.includes(Permission.NOTEPAD_VIEW)) {
        publicNotepad.title = this.title
        publicNotepad.share = this.share
        publicNotepad.collaborators = Array.from(this.users.values())
            .filter(val => !val.roles.includes(Role.OWNER))
            .map(val => ({ subject: val.subject, roles: val.roles }))
    }
    return Object.freeze(publicNotepad)
}

export default mongoose.model<INotepadSchema>('Notepad', NotepadSchema)
