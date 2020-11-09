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
            match === 'true'
        )
        return createResponse(res, 200, 'Notes fetched.', {
            notes: notes.map(n => n.getPublicInfo(res))
        })
    } catch (err) { return next(err) }
}

const addOrDeleteTags = (operation: 'add' | 'delete') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { tag } = req.query

            const tagsArray = splitTagsString(tag as string)
            if (!tagsArray) return createResponse(res, 400)

            const newNote = operation === 'add'
                ? await noteTagsQuery.add(id, getAuthUser(res).id, tagsArray)
                : await noteTagsQuery.delete(id, getAuthUser(res).id, tagsArray)
            return newNote
                ? createResponse(res, 200, operation === 'add' ? 'Tags added.' : 'Tags deleted.', {
                    tags: newNote.getPublicInfo(res).tags || []
                })
                : createResponse(res, 400, 'Couldn\'t modify tags.')
        } catch (err) { return next(err) }
    }
}

export default { getByTag, addTags: addOrDeleteTags('add'), deleteTags: addOrDeleteTags('delete') }
