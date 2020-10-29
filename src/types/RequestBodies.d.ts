/* eslint-disable camelcase */
import { Color } from '../models/Note'
import { IUserSchema } from '../models/User'
import { NoteRole } from '../utils/accessManagement.util'

export interface LoginBody {
    email: IUserSchema['email'] | IUserSchema['password']
    password: string
    'g-recaptcha-response'?: string
}

export interface RegisterBody {
    email: IUserSchema['email']
    username: IUserSchema['username']
    password: string,
    confirm_password: string
    'g-recaptcha-response'?: string
}

export interface NewPasswordBody {
    new_password: string
    confirm_new_password: string
    'g-recaptcha-response'?: string
}

export interface OldPasswordBody {
    old_password: string
}

export interface EmailBody {
    email: IUserSchema['email'] | IUserSchema['username']
}

export interface NoteBody {
    title?: string
    content?: string
    archived?: boolean | 'true' | 'false'
    fixed?: boolean | 'true' | 'false'
    color?: Color
}

export interface AddAttachmentBody {
    title?: string
    description?: string
    photo: File
}

export interface EditAttachmentBody {
    title?: string
    description?: string
}

export interface CollaboratorBody {
    user: IUserSchema['username'] | IUserSchema['email']
    type: NoteRole.PRIMARY_COLLABORATOR | NoteRole.SECONDARY_COLLABORATOR | NoteRole.OBSERVER
}

export interface CheckCredentialsBody {
    username?: IUserSchema['username']
    email?: IUserSchema['email']
}

export interface CommentBody {
    text: string
}
