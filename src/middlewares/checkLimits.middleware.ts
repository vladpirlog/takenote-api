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
        const length = await limitsQuery.note(getAuthUser(res).id)
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
        const length = await limitsQuery.tag(id, getAuthUser(res).id)
        if (length === undefined || length + tagsArray.length > constants.limits.perNote.tags) {
            return createResponse(res, 400, 'Tags limit exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Middleware function for checking the attachments limit for a note.
 */
const forAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const length = await limitsQuery.attachment(id)
        if (length + 1 > constants.limits.perNote.attachments) {
            return createResponse(res, 400, 'Limit for attachments exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Middleware function for checking the collaborators limit for a note.
 */
const forCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const length = await limitsQuery.collaborator(id)
        if (length + 1 > constants.limits.perNote.collaborators) {
            return createResponse(res, 400, 'Limit for collaborators exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

export default {
    forNote,
    forTag,
    forAttachment,
    forCollaborator
}
