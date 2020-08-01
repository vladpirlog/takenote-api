import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteTagsQuery from '../queries/note.tags.query'
import parseStringToArray from '../utils/parseStringToArray.util'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'
import checkNoteLimits from '../utils/checkNoteLimits.util'

const getByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tag, match } = req.query
        const notes = await noteTagsQuery.get(
            getAuthenticatedUser(res)?.userID,
            tag as string,
            match === 'true')
        return createResponse(res, 200, 'Notes fetched.', { notes })
    } catch (err) { return next(err) }
}

const addTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const tags = parseStringToArray(req.query.tags as string)
        if (
            !Array.isArray(tags) ||
            tags.length === 0 ||
            tags.includes('')
        ) { return createResponse(res, 400, 'Tags field invalid.') }

        if (!await checkNoteLimits.forTag(id, getAuthenticatedUser(res)?.userID, tags)) {
            return createResponse(res, 400, 'Tags limit exceeded.')
        }
        const newNote = await noteTagsQuery.add(
            id, getAuthenticatedUser(res)?.userID, tags
        )
        return newNote
            ? createResponse(res, 200, 'Tags added.', {
                tags: newNote.tags
            }) : createResponse(res, 400, 'Couldn\'t add tags.')
    } catch (err) { return next(err) }
}

const deleteTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const tags = parseStringToArray(req.query.tags as string)

        if (
            !Array.isArray(tags) ||
            tags.length === 0 ||
            tags.includes('')
        ) { return createResponse(res, 400, 'Tags field invalid.') }

        const newNote = await noteTagsQuery.delete(
            id, getAuthenticatedUser(res)?.userID, tags
        )
        return newNote
            ? createResponse(res, 200, 'Tags deleted.')
            : createResponse(res, 400, 'Couldn\'t delete tags.')
    } catch (err) { return next(err) }
}

export default { getByTag, addTags, deleteTags }
