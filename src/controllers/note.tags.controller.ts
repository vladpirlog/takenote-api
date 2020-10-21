import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteTagsQuery from '../queries/note.tags.query'
import splitTagsString from '../utils/splitTagsString.util'
import getAuthUser from '../utils/getAuthUser.util'

const getByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tag, match } = req.query
        const notes = await noteTagsQuery.get(
            getAuthUser(res).id,
            tag as string,
            match === 'true')
        return createResponse(res, 200, 'Notes fetched.', { notes })
    } catch (err) { return next(err) }
}

const addTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { tags } = req.query

        const tagsArray = splitTagsString(tags as string)
        if (!tagsArray) return createResponse(res, 400)

        const newNote = await noteTagsQuery.add(
            id, getAuthUser(res).id, tagsArray
        )
        return newNote
            ? createResponse(res, 200, 'Tags added.', {
                tags: newNote.getPublicInfo(getAuthUser(res).id).tags || []
            }) : createResponse(res, 400, 'Couldn\'t add tags.')
    } catch (err) { return next(err) }
}

const deleteTags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { tags } = req.query

        const tagsArray = splitTagsString(tags as string)
        if (!tagsArray) return createResponse(res, 400)

        const newNote = await noteTagsQuery.delete(
            id, getAuthUser(res).id, tagsArray
        )
        return newNote
            ? createResponse(res, 200, 'Tags deleted.', {
                tags: newNote.getPublicInfo(getAuthUser(res).id).tags || []
            })
            : createResponse(res, 400, 'Couldn\'t delete tags.')
    } catch (err) { return next(err) }
}

export default { getByTag, addTags, deleteTags }
