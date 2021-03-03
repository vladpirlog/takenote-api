import constants from '../config/constants.config'
import limitsQuery from '../queries/limits.query'
import { NextFunction, Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import splitTagsString from '../utils/splitTagsString.util'

/**
 * Higher-order function.
 * Returns a middleware function for checking the notes or notepads limit for a user.
 */
const forNoteOrNotepad = (type: 'note' | 'notepad') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session.userID) throw new Error('User not logged in.')
            const length = await limitsQuery[type](req.session.userID)
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
        if (!req.session.userID) throw new Error('User not logged in.')
        const { id } = req.params
        const { tag } = req.query

        const tagsArray = splitTagsString(tag as string)
        if (!tagsArray) return createResponse(res, 400)
        const length = await limitsQuery.tag(id, req.session.userID)
        if (length === undefined || length + tagsArray.length > constants.limits.perNote.tags) {
            return createResponse(res, 400, 'Tags limit exceeded.')
        }
        return next()
    } catch (err) { return next(err) }
}

/**
 * Higher-order function.
 * @returns a middleware function for checking the attachments, drawings or collaborators limit for a note.
 */
const forAttachmentDrawingOrCollaborator = (type: 'attachment' | 'drawing' | 'collaborator') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params

            const length = await limitsQuery[type](id)
            let limit: number
            switch (type) {
            case 'attachment':
                limit = constants.limits.perNote.attachments
                break
            case 'drawing':
                limit = constants.limits.perNote.drawings
                break
            default:
                limit = constants.limits.perNote.collaborators
                break
            }
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
    forAttachment: forAttachmentDrawingOrCollaborator('attachment'),
    forDrawing: forAttachmentDrawingOrCollaborator('drawing'),
    forCollaborator: forAttachmentDrawingOrCollaborator('collaborator')
}
