import { Request, Response, NextFunction } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import Joi from 'joi'
import {
    AddAttachmentBody,
    CheckCredentialsBody,
    CollaboratorBody,
    CommentBody,
    EditAttachmentBody,
    EmailBody,
    LoginBody,
    NewPasswordBody,
    NoteBody,
    NotepadBody,
    OldPasswordBody,
    RegisterBody
} from '../types/RequestBodies'
import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'

/**
 * Creates a Joi schema for a required string that matches the given regex.
 * @param regex a regex that the string must match; if undefined, no regex matching is done
 */
const getJoiStringSchema = (regex?: RegExp) => {
    if (regex) return Joi.string().required().regex(regex)
    return Joi.string().required()
}

const EMAIL_SCHEMA = Joi.string().required().email()
const EMAIL_OR_USERNAME_SCHEMA = Joi
    .when(Joi.ref('.'), {
        is: EMAIL_SCHEMA,
        otherwise: getJoiStringSchema(constants.regex.username)
    })
const ATTACHMENT_TITLE_SCHEMA = Joi.string().max(32).allow('')
const ATTACHMENT_DESCRIPTION_SCHEMA = Joi.string().max(256).allow('')
const COMMENT_TEXT_SCHEMA = Joi.string().required().max(120)
const NOTE_AND_NOTEPAD_TITLE_SCHEMA = Joi.string().max(100).allow('')
const NOTE_CONTENT_SCHEMA = Joi.string().max(10000).allow('')
const POSITIVE_INTEGER_SCHEMA = Joi.number().integer().positive()

const RESET_TOKEN_REGEX = new RegExp(
    `^${constants.idInfo.reset.prefix}[a-zA-Z0-9_-]{${constants.idInfo.reset.length}}$`
)
const CONFIRMATION_TOKEN_REGEX = new RegExp(
    `^${constants.idInfo.confirmation.prefix}[a-zA-Z0-9_-]{${constants.idInfo.confirmation.length}}$`
)
const TFA_OTP_REGEX = /^[0-9]{6}$/
const TFA_BACKUP_CODE_REGEX = new RegExp(
    `^[a-zA-Z0-9_-]{${constants.authentication.backupCodeLength}}$`
)
const NOTEPAD_ID_REGEX = new RegExp(
    `^${constants.idInfo.notepad.prefix}[a-zA-Z0-9_-]{${constants.idInfo.notepad.length}}$`
)

const bodySchemas = {
    login: Joi.object<LoginBody>({
        email: EMAIL_OR_USERNAME_SCHEMA,
        password: getJoiStringSchema(constants.regex.password),
        'g-recaptcha-response': Joi.string()
    }),
    register: Joi.object<RegisterBody>({
        username: getJoiStringSchema(constants.regex.username),
        email: EMAIL_SCHEMA,
        password: getJoiStringSchema(constants.regex.password),
        confirm_password: Joi.ref('password'),
        'g-recaptcha-response': Joi.string()
    }),
    newPassword: Joi.object<NewPasswordBody>({
        new_password: getJoiStringSchema(constants.regex.password),
        confirm_new_password: Joi.ref('new_password'),
        'g-recaptcha-response': Joi.string()
    }),
    oldPassword: Joi.object<OldPasswordBody>({
        old_password: getJoiStringSchema(constants.regex.password)
    }),
    email: Joi.object<EmailBody>({
        email: EMAIL_OR_USERNAME_SCHEMA
    }),
    note: Joi.object<NoteBody>({
        title: NOTE_AND_NOTEPAD_TITLE_SCHEMA,
        content: NOTE_CONTENT_SCHEMA,
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
        user: EMAIL_OR_USERNAME_SCHEMA,
        type: Joi.string().required().valid(
            Role.PRIMARY_COLLABORATOR, Role.SECONDARY_COLLABORATOR, Role.OBSERVER
        )
    }),
    checkCredentials: Joi.object<CheckCredentialsBody>({
        username: Joi.string().regex(constants.regex.username),
        email: Joi.string().email()
    }).or('username', 'email'),
    comment: Joi.object<CommentBody>({
        text: COMMENT_TEXT_SCHEMA
    }),
    notepad: Joi.object<NotepadBody>({
        title: NOTE_AND_NOTEPAD_TITLE_SCHEMA
    })
}

const querySchemas = {
    resetToken: Joi.object({
        token: getJoiStringSchema(RESET_TOKEN_REGEX)
    }),
    confirmationToken: Joi.object({
        token: getJoiStringSchema(CONFIRMATION_TOKEN_REGEX)
    }),
    resetOrConfirmationToken: Joi.object({
        token: Joi
            .when(Joi.ref('.'), {
                is: getJoiStringSchema(RESET_TOKEN_REGEX),
                otherwise: getJoiStringSchema(CONFIRMATION_TOKEN_REGEX)
            })
    }),
    tfa: Joi.object({
        code: Joi
            .when(Joi.ref('.'), {
                is: getJoiStringSchema(TFA_OTP_REGEX),
                otherwise: getJoiStringSchema(TFA_BACKUP_CODE_REGEX)
            }),
        remember: Joi.boolean()
    }),
    googleOauth: Joi.object({
        code: getJoiStringSchema()
    }),
    tag: Joi.object({
        tag: getJoiStringSchema().max(200),
        match: Joi.boolean()
    }),
    commentsSectionState: Joi.object({
        enabled: Joi.boolean().required()
    }),
    getAllNotes: Joi.object({
        collaborations: Joi.boolean(),
        skip: POSITIVE_INTEGER_SCHEMA,
        limit: POSITIVE_INTEGER_SCHEMA,
        archived: Joi.boolean()
    }),
    share: Joi.object({
        active: Joi.boolean(),
        get_new: Joi.boolean()
    }),
    moveNote: Joi.object({
        to: Joi.when(Joi.ref('.'), {
            is: getJoiStringSchema(NOTEPAD_ID_REGEX),
            otherwise: Joi.valid('default')
        })
    }),
    getAllNotepads: Joi.object({
        collaborations: Joi.boolean(),
        skip: POSITIVE_INTEGER_SCHEMA,
        limit: POSITIVE_INTEGER_SCHEMA,
        include_notes: Joi.boolean()
    }),
    getOneNotepad: Joi.object({
        include_notes: Joi.boolean()
    })
}

/**
 * Higher order function for checking the request body against a Joi schema.
 * @param type the type of body to be validated
 * @param rejectMessage the message to be sent in case of failure; defaults to 'Unprocessable Entity'
 * @returns a middleware function
 */
export const validateBody = (type: keyof typeof bodySchemas, rejectMessage?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await bodySchemas[type].validateAsync(req.body)
            return next()
        } catch (err) {
            return createResponse(res, 422, rejectMessage)
        }
    }
}

/**
 * Higher order function for checking the request query against a Joi schema.
 * @param type the type of query to be validated
 * @param rejectMessage the message to be sent in case of failure; defaults to 'Unprocessable Entity'
 * @returns a middleware function
 */
export const validateQuery = (type: keyof typeof querySchemas, rejectMessage?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await querySchemas[type].validateAsync(req.query)
            return next()
        } catch (err) {
            return createResponse(res, 422, rejectMessage)
        }
    }
}
