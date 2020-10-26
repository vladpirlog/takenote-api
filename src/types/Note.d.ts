import { Document } from 'mongoose'
import Color from '../enums/Color.enum'
import NoteRole from '../enums/NoteRole.enum'
import { IAttachmentSchema } from './Attachment'
import { IUserSchema } from './User'

export interface INoteSchema extends Document {
    /** ID of the note */
    id: string
    title: string
    content: string
    attachments: IAttachmentSchema[]
    share: { code: string, active: boolean }
    users: {
        subject: {
            id: IUserSchema['id']
            username: IUserSchema['username']
            email: IUserSchema['email']
        }
        tags: string[]
        archived: boolean
        color: Color
        role: NoteRole
        fixed: boolean
    }[]
    createdAt: Date
    updatedAt: Date

    /**
     * Returns public note data that can be viewed by the frontend.
     * @param userID id of the user which requests the note
     */
    getPublicInfo(userID?: IUserSchema['id']): PublicNoteInfo
}

export type PublicNoteInfo =
    Pick<INoteSchema, 'id' | 'title' | 'content' | 'attachments' | 'share' | 'createdAt' | 'updatedAt'>
    & { owner: INoteSchema['users'][0]['subject'] }
    & Partial<Omit<INoteSchema['users'][0], 'subject'> & {
        collaborators: Pick<INoteSchema['users'][0], 'subject' | 'role'>[],
    }>
