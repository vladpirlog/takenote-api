import { IEntity } from './Entity'
import { IUserSchema } from './User'
import { INoteSchema, PublicNoteInfo } from './Note'
import { Role } from '../enums/Role.enum'

export interface INotepadSchema extends IEntity {
    title: string
    users: Map<IUserSchema['id'], {
        subject: Pick<IUserSchema, 'id' | 'email'>
        roles: Role[]
    }>
    share: { code?: string, active: boolean }

    /**
     * Returns public notepad data that can be viewed by the user.
     * @param userID the id of the authenticated user
     */
    getPublicInfo(userID?: IUserSchema['id']): Readonly<PublicNotepadInfo>
}

type PublicNotepadInfoMandatoryFields = Pick<INotepadSchema, 'id' | 'createdAt' | 'updatedAt'>
    & { owner: Pick<IUserSchema, 'id' | 'email'> }

type PublicNotepadInfoOptionalFields = Partial<
    Pick<INotepadSchema, 'title' | 'share'> & {
        notes: PublicNoteInfo[]
        collaborators: {
            subject: Pick<IUserSchema, 'id' | 'email'>
            roles: Role[]
        }[]
    }
>

export type PublicNotepadInfo = PublicNotepadInfoMandatoryFields & PublicNotepadInfoOptionalFields

export type NotepadAndNotes = { notepad: INotepadSchema, notes: INoteSchema[] }
