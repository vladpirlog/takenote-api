import constants from '../config/constants.config'
import limitsQuery from '../queries/limits.query'
import { NextFunction, Request, Response } from 'express'
import getAuthUser from '../utils/getAuthUser.util'
import createResponse from '../utils/createResponse.util'
import splitTagsString from '../utils/splitTagsString.util'

/**
 * Higher-order function.
 * Returns a middleware function for checking the notes or notepads limit for a user.
 */
const forNoteOrNotepad = (type: 'note' | 'notepad') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const length = await limitsQuery[type](getAuthUser(res).id)
            const limit = type === 'note'
                ? constants.limits.perUser.notes
                : constants.limits.perUser.notepads
            if (length + 1 <= limit) return next()
            return createResponse(res, 400, `Limit for ${type}s exceeded.`)
        } catch (err) { return next(err) }
    }
}

/**
 * Middleware function for checking the note tags limit.
 */
const forTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { tag } = req.query

        const tagsArray = splitTagsString(tag as string)
        if (!tagsArray) return createResponse(res, 400)
        const length = await limitsQuery.tag(id, getAuthUser(res).id)
        if (length === undefined || length + tagsArray.length > constants.limits.perNote.tags) {
            return createResponse(res, 400, 'Tags limit exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Higher-order function.
 * Returns a middleware function for checking the attachments or collaborators limit for a note.
 */
const forAttachmentOrCollaborator = (type: 'attachment' | 'collaborator') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params

            const length = await limitsQuery[type](id)
            const limit = type === 'attachment'
                ? constants.limits.perNote.attachments
                : constants.limits.perNote.collaborators
            if (length + 1 > limit) {
                return createResponse(res, 400, `Limit for ${type}s exceeded.`)
            }
            return next()
        } catch (err) { return next(err) }
    }
}

export default {
    forNote: forNoteOrNotepad('note'),
    forNotepad: forNoteOrNotepad('notepad'),
    forTag,
    forAttachment: forAttachmentOrCollaborator('attachment'),
    forCollaborator: forAttachmentOrCollaborator('collaborator')
}
