import Color from '../enums/Color.enum'
import { NoteRole } from '../utils/accessManagement.util'
import { IAttachmentSchema } from './Attachment'
import { ICommentSchema } from './Comment'
import { IEntity } from './Entity'
import { IUserSchema } from './User'

export interface INoteSchema extends IEntity {
    title: string
    content: string
    attachments: IAttachmentSchema[]
    comments: {
        enabled: boolean
        items: ICommentSchema[]
    }
    share: { code: string, active: boolean }
    users: {
        subject: Pick<IUserSchema, 'id' | 'username' | 'email'>
        tags: string[]
        archived: boolean
        color: Color
        roles: NoteRole[]
        fixed: boolean
    }[]

    /**
     * Returns public note data that can be viewed by the frontend.
     * @param userID id of the user which requests the note
     */
    getPublicInfo(userID?: IUserSchema['id']): PublicNoteInfo
}

export type PublicNoteInfo =
    Pick<INoteSchema, 'id' | 'title' | 'content' | 'createdAt' | 'updatedAt'>
    & { owner: Pick<IUserSchema, 'id' | 'username' | 'email'> }
    & Partial<
        Pick<INoteSchema, 'comments' | 'attachments' | 'share'>
        & { collaborators: Pick<INoteSchema['users'][0], 'subject' | 'roles'>[] }
        & Pick<INoteSchema['users'][0], 'archived' | 'color' | 'fixed' | 'tags'>
    >
