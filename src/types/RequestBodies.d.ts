/* eslint-disable camelcase */
import Color from '../enums/Color.enum'
import { DrawingBackgroundPattern, DrawingBrushType } from '../enums/Drawing.enum'
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
    archived?: 'true' | 'false'
    fixed?: 'true' | 'false'
    color?: Color
}

export interface AddAttachmentBody {
    title?: string
    description?: string
    image: File
}

export interface EditAttachmentBody {
    title?: string
    description?: string
}

export interface DrawingBody {
    brush_color: string,
    brush_size: number,
    brush_type: DrawingBrushType,
    background_pattern: DrawingBackgroundPattern,
    background_color: string,
    variable_pen_pressure: 'true' | 'false',
    drawing: File
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
