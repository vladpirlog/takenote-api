import { Request, Response, NextFunction } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import Joi from 'joi'
import {
    AddAttachmentBody,
    CheckCredentialsBody,
    CollaboratorBody,
    EditAttachmentBody,
    EmailBody,
    LoginBody,
    NewPasswordBody,
    NoteBody,
    OldPasswordBody,
    RegisterBody
} from '../types/RequestBodies'
import Color from '../enums/Color.enum'
import NoteRole from '../enums/NoteRole.enum'

const EMAIL_SCHEMA = Joi.string().required().email()
const USERNAME_SCHEMA = Joi.string().required().regex(constants.regex.username)
const PASSWORD_SCHEMA = Joi.string().required().regex(constants.regex.password)
const ATTACHMENT_TITLE_SCHEMA = Joi.string().max(32)
const ATTACHMENT_DESCRIPTION_SCHEMA = Joi.string().max(256)

const schemas = {
    login: Joi.object<LoginBody>({
        email: Joi
            .when(Joi.ref('.'), {
                is: EMAIL_SCHEMA,
                otherwise: USERNAME_SCHEMA
            }),
        password: PASSWORD_SCHEMA,
        'g-recaptcha-response': Joi.string()
    }),
    register: Joi.object<RegisterBody>({
        username: USERNAME_SCHEMA,
        email: EMAIL_SCHEMA,
        password: PASSWORD_SCHEMA,
        confirm_password: Joi.ref('password'),
        'g-recaptcha-response': Joi.string()
    }),
    newPassword: Joi.object<NewPasswordBody>({
        new_password: PASSWORD_SCHEMA,
        confirm_new_password: Joi.ref('new_password'),
        'g-recaptcha-response': Joi.string()
    }),
    oldPassword: Joi.object<OldPasswordBody>({
        old_password: PASSWORD_SCHEMA
    }),
    email: Joi.object<EmailBody>({
        email: Joi
            .when(Joi.ref('.'), {
                is: EMAIL_SCHEMA,
                otherwise: USERNAME_SCHEMA
            })
    }),
    note: Joi.object<NoteBody>({
        title: Joi.string().max(100).allow(''),
        content: Joi.string().max(10000).allow(''),
        archived: Joi.boolean(),
        fixed: Joi.boolean(),
        color: Joi.valid(...Object.values(Color))
    }),
    addAttachment: Joi.object<AddAttachmentBody>({
        title: ATTACHMENT_TITLE_SCHEMA,
        description: ATTACHMENT_DESCRIPTION_SCHEMA
    }),
    editAttachment: Joi.object<EditAttachmentBody>({
        title: ATTACHMENT_TITLE_SCHEMA,
        description: ATTACHMENT_DESCRIPTION_SCHEMA
    }).or('title', 'description'),
    collaborator: Joi.object<CollaboratorBody>({
        user: Joi
            .when(Joi.ref('.'), {
                is: EMAIL_SCHEMA,
                otherwise: USERNAME_SCHEMA
            }),
        type: Joi.string().required().valid(NoteRole.VIEWER, NoteRole.EDITOR)
    }),
    checkCredentials: Joi.object<CheckCredentialsBody>({
        username: Joi.string().regex(constants.regex.username),
        email: Joi.string().email()
    }).or('username', 'email')
}

type ValidateBodyArgument = 'login' | 'register' | 'newPassword' | 'oldPassword' |
    'email' | 'note' | 'addAttachment' | 'editAttachment' | 'collaborator' | 'checkCredentials'

/**
 * Higher order function for checking the request body against a Joi schema.
 * @param type the type of body to be validated
 * @param rejectMessage the message to be sent in case of failure; defaults to 'Unprocessable Entity'
 * @returns a middleware function
 */
const validateBody = (type: ValidateBodyArgument, rejectMessage?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schemas[type].validateAsync(req.body)
            return next()
        } catch (err) {
            return createResponse(res, 422, rejectMessage)
        }
    }
}

export default validateBody
