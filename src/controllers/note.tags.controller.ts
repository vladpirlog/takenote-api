import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import noteTagsQuery from '../queries/note.tags.query'
import parseStringToArray from '../utils/parseStringToArray.util'

const addTags = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const tags = parseStringToArray(req.query.tags as string)
        if (
            !Array.isArray(tags) ||
            tags.length === 0 ||
            typeof tags[0] !== 'string'
        ) { return createResponse(res, 400, 'Tags field invalid.') }

        const newNote = await noteTagsQuery.addTags(
            id,
            res.locals.user.userID,
            tags
        )

        if (!newNote) return createResponse(res, 400, 'Couldn\'t add tags.')

        return createResponse(res, 200, 'Tags added.', {
            tags: newNote.tags
        })
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

const deleteTags = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const tags = parseStringToArray(req.query.tags as string)

        if (
            !Array.isArray(tags) ||
            tags.length === 0 ||
            typeof tags[0] !== 'string'
        ) { return createResponse(res, 400, 'Tags field invalid.') }

        const newNote = await noteTagsQuery.deleteTags(
            id,
            res.locals.user.userID,
            tags
        )
        if (!newNote) return createResponse(res, 400, 'Couldn\'t delete tags.')

        return createResponse(res, 200, 'Tags deleted.')
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

export default { addTags, deleteTags }
