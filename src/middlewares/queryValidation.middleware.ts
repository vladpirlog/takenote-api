import { Request, Response, NextFunction } from 'express'
import constants from '../config/constants.config'
import createResponse from '../utils/createResponse.util'
import Joi from 'joi'

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

/**
 * Creates a Joi schema for a required string that matches the given regex.
 * @param regex a regex that the string must match; if undefined, no regex matching is done
 */
const getJoiStringSchema = (regex?: RegExp) => {
    if (regex) return Joi.string().required().regex(regex)
    return Joi.string().required()
}

const schemas = {
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
    notes: Joi.object({
        collaborations: Joi.boolean(),
        skip: Joi.number().integer(),
        limit: Joi.number().integer(),
        archived: Joi.boolean()
    }),
    share: Joi.object({
        active: Joi.boolean(),
        get_new: Joi.boolean()
    })
}

type ValidateQueryArgument = 'resetToken' | 'confirmationToken' | 'resetOrConfirmationToken'
| 'tfa' | 'googleOauth' | 'tag' | 'commentsSectionState' | 'notes' | 'share'

/**
 * Higher order function for checking the request query against a Joi schema.
 * @param type the type of query to be validated
 * @param rejectMessage the message to be sent in case of failure; defaults to 'Unprocessable Entity'
 * @returns a middleware function
 */
const validateQuery = (type: ValidateQueryArgument, rejectMessage?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schemas[type].validateAsync(req.query)
            return next()
        } catch (err) {
            return createResponse(res, 422, rejectMessage)
        }
    }
}

export default validateQuery
