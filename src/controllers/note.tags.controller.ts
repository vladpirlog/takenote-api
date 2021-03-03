import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteTagsQuery from '../queries/note.tags.query'
import splitTagsString from '../utils/splitTagsString.util'

const getByTag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const { tag, match } = req.query
        const notes = await noteTagsQuery.get(
            req.session.userID,
            tag as string,
            match === 'true'
        )
        return createResponse(res, 200, 'Notes fetched.', {
            notes: notes.map(n => n.getPublicInfo(req.session.userID))
        })
    } catch (err) { return next(err) }
}

const addOrDeleteTags = (operation: 'add' | 'delete') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session.userID) throw new Error('User not logged in.')
            const { id } = req.params
            const { tag } = req.query

            const tagsArray = splitTagsString(tag as string)
            if (!tagsArray) return createResponse(res, 400)

            const newNote = operation === 'add'
                ? await noteTagsQuery.add(id, req.session.userID, tagsArray)
                : await noteTagsQuery.delete(id, req.session.userID, tagsArray)
            return newNote
                ? createResponse(res, 200, operation === 'add' ? 'Tags added.' : 'Tags deleted.', {
                    tags: newNote.getPublicInfo(req.session.userID).tags || []
                })
                : createResponse(res, 400, 'Couldn\'t modify tags.')
        } catch (err) { return next(err) }
    }
}

export default { getByTag, addTags: addOrDeleteTags('add'), deleteTags: addOrDeleteTags('delete') }
