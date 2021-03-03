import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'
import { IAttachmentSchema, PublicAttachmentInfo } from './Attachment'
import { ICommentSchema, PublicCommentInfo } from './Comment'
import { IDrawingSchema, PublicDrawingInfo } from './Drawing'
import { IEntity } from './Entity'
import { INotepadSchema } from './Notepad'
import { IUserSchema } from './User'

export interface INoteSchema extends IEntity {
    title: string
    content: string
    attachments: IAttachmentSchema[]
    drawings: IDrawingSchema[]
    comments: {
        enabled: boolean
        items: ICommentSchema[]
    }
    share: { code?: string, active: boolean }
    users: Map<IUserSchema['id'], {
        subject: Pick<IUserSchema, 'id' | 'email'>
        tags: string[]
        archived: boolean
        color: Color
        roles: Role[]
        fixed: boolean
    }>
    notepadID: INotepadSchema['id']

    /**
     * Returns public note data that can be viewed by the user.
     * @param userID the id of the authenticated user
     */
    getPublicInfo(userID?: IUserSchema['id']): Readonly<PublicNoteInfo>
}

type PublicNoteInfoMandatoryFields = Pick<INoteSchema, 'id' | 'createdAt' | 'updatedAt'>
    & { owner: Pick<IUserSchema, 'id' | 'email'> }

type PublicNoteInfoOptionalFields = Partial<
        Pick<INoteSchema, 'title' | 'content' | 'share'>
        & {
            collaborators: {
                subject: Pick<IUserSchema, 'id' | 'email'>
                roles: Role[]
            }[]
            comments: {
                enabled: INoteSchema['comments']['enabled']
                items: PublicCommentInfo[]
            }
            attachments: PublicAttachmentInfo[]
            drawings: PublicDrawingInfo[]
            archived: boolean
            color: Color
            fixed: boolean
            tags: string[]
        }
    >

export type PublicNoteInfo = PublicNoteInfoMandatoryFields & PublicNoteInfoOptionalFields
