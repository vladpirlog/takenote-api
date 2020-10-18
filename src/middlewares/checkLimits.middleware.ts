import constants from '../config/constants.config'
import limitsQuery from '../queries/limits.query'
import { NextFunction, Request, Response } from 'express'
import getAuthUser from '../utils/getAuthUser.util'
import createResponse from '../utils/createResponse.util'
import splitTagsString from '../utils/splitTagsString.util'

/**
 * Middleware function for checking the note limit.
 */
const forNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const length = await limitsQuery.note(getAuthUser(res)?._id)
        if (length + 1 <= constants.limits.perUser.notes) return next()
        return createResponse(res, 400, 'Notes limit exceeded.')
    } catch (err) { return next(err) }
}

/**
 * Middleware function for checking the note tags limit.
 */
const forTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { tags } = req.query

        const tagsArray = splitTagsString(tags as string)
        if (!tagsArray) return createResponse(res, 400)
        const length = await limitsQuery.tag(id, getAuthUser(res)?._id)
        if (length === undefined || length + tagsArray.length > constants.limits.perNote.tags) {
            return createResponse(res, 400, 'Tags limit exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Higher order function. Returns a middleware function for checking the note attachments
 * or permissions limit.
 */
const forPermissionOrAttachment = (type: 'attachments' | 'permissions') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params

            const length = await limitsQuery.permissionOrAttachment(type)(id, getAuthUser(res)?._id)
            if (length === undefined || length + 1 > constants.limits.perNote[type]) {
                return createResponse(res, 400, `Limit for ${type} exceeded.`)
            }
            return next()
        } catch (err) { return next(err) }
    }
}

export default {
    forNote,
    forTag,
    forAttachment: forPermissionOrAttachment('attachments'),
    forPermission: forPermissionOrAttachment('permissions')
}
