import { Request, Response, NextFunction } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import { Color } from '../interfaces/color.enum'
import Joi from 'joi'
import { NoteRole } from '../models/Note'
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

export const validateLoginBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<LoginBody>({
        email: Joi
            .when(Joi.ref('.'), {
                is: Joi.string().required().email(),
                otherwise: Joi.string().required().regex(constants.regex.username)
            }),
        password: Joi.string().required().regex(constants.regex.password)
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}

export const validateRegisterBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<RegisterBody>({
        username: Joi.string().required().regex(constants.regex.username),
        email: Joi.string().required().email(),
        password: Joi.string().required().regex(constants.regex.password),
        confirm_password: Joi.ref('password')
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}

export const validateNewPasswordBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<NewPasswordBody>({
        new_password: Joi.string().required().regex(constants.regex.password),
        confirm_new_password: Joi.ref('new_password')
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}

export const validateOldPasswordBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<OldPasswordBody>({
        old_password: Joi.string().required().regex(constants.regex.password)
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}

export const validateEmailBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<EmailBody>({
        email: Joi
            .when(Joi.ref('.'), {
                is: Joi.string().required().email(),
                otherwise: Joi.string().required().regex(constants.regex.username)
            })
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}

export const validateNoteBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<NoteBody>({
        title: Joi.string().max(100),
        content: Joi.string().max(10000),
        archived: Joi.boolean().default(false),
        fixed: Joi.boolean().default(false),
        color: Joi.valid(...Object.values(Color)).default(Color.DEFAULT)
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Note invalid.')
    }
}

export const validateAddAttachmentBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<AddAttachmentBody>({
        title: Joi.string().max(32).default(''),
        description: Joi.string().max(256).default('')
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Attachment invalid.')
    }
}

export const validateEditAttachmentBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<EditAttachmentBody>({
        title: Joi.string().max(32),
        description: Joi.string().max(256)
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Attachment invalid.')
    }
}

export const validateCollaboratorBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<CollaboratorBody>({
        user: Joi
            .when(Joi.ref('.'), {
                is: Joi.string().required().email(),
                otherwise: Joi.string().required().regex(constants.regex.username)
            }),
        type: Joi.string().required().valid(NoteRole.VIEWER, NoteRole.EDITOR)
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Collaborator invalid.')
    }
}

export const validateCheckCredentialsBody = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<CheckCredentialsBody>({
        username: Joi.string().regex(constants.regex.username),
        email: Joi.string().email()
    })

    try {
        await schema.validateAsync(req.body)
        return next()
    } catch (err) {
        return createResponse(res, 422, 'Credentials invalid.')
    }
}
