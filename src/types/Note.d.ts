import { Response } from 'express'
import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'
import { IAttachmentSchema, PublicAttachmentInfo } from './Attachment'
import { ICommentSchema, PublicCommentInfo } from './Comment'
import { IEntity } from './Entity'
import { INotepadSchema } from './Notepad'
import { IUserSchema } from './User'

export interface INoteSchema extends IEntity {
    title: string
    content: string
    attachments: IAttachmentSchema[]
    comments: {
        enabled: boolean
        items: ICommentSchema[]
    }
    share: { code?: string, active: boolean }
    users: Map<IUserSchema['id'], {
        subject: Pick<IUserSchema, 'id' | 'username' | 'email'>
        tags: string[]
        archived: boolean
        color: Color
        roles: Role[]
        fixed: boolean
    }>
    notepadID: INotepadSchema['id']

    /**
     * Returns public note data that can be viewed by the user.
     * @param res object of type express.Response used for accessing the authenticated user
     * @param isShared true if the note is viewed through the sharing URL
     */
    getPublicInfo(res: Response, isShared: boolean = false): Readonly<PublicNoteInfo>
}

type PublicNoteInfoMandatoryFields = Pick<INoteSchema, 'id' | 'createdAt' | 'updatedAt'>
    & { owner: Pick<IUserSchema, 'id' | 'username' | 'email'> }

type PublicNoteInfoOptionalFields = Partial<
        Pick<INoteSchema, 'title' | 'content' | 'share'>
        & {
            collaborators: {
                subject: Pick<IUserSchema, 'id' | 'username' | 'email'>
                roles: Role[]
            }[]
            comments: {
                enabled: INoteSchema['comments']['enabled']
                items: PublicCommentInfo[]
            }
            attachments: PublicAttachmentInfo[]
            archived: boolean
            color: Color
            fixed: boolean
            tags: string[]
        }
    >

export type PublicNoteInfo = PublicNoteInfoMandatoryFields & PublicNoteInfoOptionalFields
