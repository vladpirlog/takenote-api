/* eslint-disable camelcase */
import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'
import { IUserSchema } from '../models/User'

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
    type: Role.PRIMARY_COLLABORATOR | Role.SECONDARY_COLLABORATOR | Role.OBSERVER
}

export interface CheckCredentialsBody {
    username?: IUserSchema['username']
    email?: IUserSchema['email']
}

export interface CommentBody {
    text: string
}

export interface NotepadBody {
    title?: string
}
