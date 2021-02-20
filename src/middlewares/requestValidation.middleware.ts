import { Request, Response, NextFunction } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import Joi from 'joi'
import {
    AddAttachmentBody,
    CollaboratorBody,
    CommentBody,
    DrawingBody,
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
import { DrawingBackgroundPattern, DrawingBrushType } from '../enums/Drawing.enum'

/**
 * Creates a Joi schema for a required string that matches the given regex.
 * @param regex a regex that the string must match; if undefined, no regex matching is done
 */
const getJoiStringSchema = (regex?: RegExp) => {
    if (regex) return Joi.string().required().regex(regex)
    return Joi.string().required()
}

const EMAIL_SCHEMA = Joi.string().required().email()
const ATTACHMENT_TITLE_SCHEMA = Joi.string().max(32).allow('')
const ATTACHMENT_DESCRIPTION_SCHEMA = Joi.string().max(256).allow('')
const COMMENT_TEXT_SCHEMA = Joi.string().required().max(120)
const NOTE_AND_NOTEPAD_TITLE_SCHEMA = Joi.string().max(100).allow('')
const NOTE_CONTENT_SCHEMA = Joi.string().max(10000).allow('')
const POSITIVE_INTEGER_SCHEMA = Joi.number().integer().positive()
const BOOLEAN_AS_STRING_SCHEMA = Joi.string().valid('true', 'false')

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
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

const bodySchemas = {
    login: Joi.object<LoginBody>({
        email: EMAIL_SCHEMA,
        password: getJoiStringSchema(constants.regex.password),
        'g-recaptcha-response': Joi.string()
    }),
    register: Joi.object<RegisterBody>({
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
        email: EMAIL_SCHEMA
    }),
    note: Joi.object<NoteBody>({
        title: NOTE_AND_NOTEPAD_TITLE_SCHEMA,
        content: NOTE_CONTENT_SCHEMA,
        archived: BOOLEAN_AS_STRING_SCHEMA,
        fixed: BOOLEAN_AS_STRING_SCHEMA,
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
    drawing: Joi.object<DrawingBody>({
        brush_color: getJoiStringSchema(HEX_COLOR_REGEX),
        brush_size: Joi.number().positive().required(),
        brush_type: Joi.valid(...Object.values(DrawingBrushType)).required(),
        background_pattern: Joi.valid(...Object.values(DrawingBackgroundPattern)).required(),
        background_color: getJoiStringSchema(HEX_COLOR_REGEX),
        variable_pen_pressure: BOOLEAN_AS_STRING_SCHEMA.required()
    }),
    collaborator: Joi.object<CollaboratorBody>({
        user: EMAIL_SCHEMA,
        type: Joi.string().required().valid(
            Role.PRIMARY_COLLABORATOR, Role.SECONDARY_COLLABORATOR, Role.OBSERVER
        )
    }),
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
        remember: BOOLEAN_AS_STRING_SCHEMA
    }),
    googleOauth: Joi.object({
        code: getJoiStringSchema()
    }),
    tag: Joi.object({
        tag: getJoiStringSchema().max(200),
        match: BOOLEAN_AS_STRING_SCHEMA
    }),
    commentsSectionState: Joi.object({
        enabled: BOOLEAN_AS_STRING_SCHEMA.required()
    }),
    getAllNotes: Joi.object({
        collaborations: BOOLEAN_AS_STRING_SCHEMA,
        skip: POSITIVE_INTEGER_SCHEMA,
        limit: POSITIVE_INTEGER_SCHEMA,
        archived: BOOLEAN_AS_STRING_SCHEMA
    }),
    share: Joi.object({
        active: BOOLEAN_AS_STRING_SCHEMA,
        get_new: BOOLEAN_AS_STRING_SCHEMA
    }),
    moveNote: Joi.object({
        to: Joi.when(Joi.ref('.'), {
            is: getJoiStringSchema(NOTEPAD_ID_REGEX),
            otherwise: Joi.valid('default')
        })
    }),
    getAllNotepads: Joi.object({
        collaborations: BOOLEAN_AS_STRING_SCHEMA,
        skip: POSITIVE_INTEGER_SCHEMA,
        limit: POSITIVE_INTEGER_SCHEMA,
        include_notes: BOOLEAN_AS_STRING_SCHEMA
    }),
    getOneNotepad: Joi.object({
        include_notes: BOOLEAN_AS_STRING_SCHEMA
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
