import { Request, Response, NextFunction } from 'express'
import getNoteRoles from '../queries/getNoteRoles.query'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import { getPermissionsFromRoles, NotePermission } from '../utils/accessManagement.util'
import noteCrudQuery from '../queries/note.crud.query'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'
import { ICommentSchema } from '../types/Comment'

/**
 * Higher-order function that verifies if the user has the required roles for a given note.
 * @param requiredPermissions an array of NoteRole elements that the user must have
 * @param paramName the req.params field where the noteID is located; defaults to 'id'
 */
const checkNotePermissions = (requiredPermissions: NotePermission[], paramName: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = getAuthUser(res).id
            const noteRoles = await getNoteRoles(req.params[paramName], userID)
            const notePermissions = getPermissionsFromRoles(noteRoles)
            return requiredPermissions.map(p => notePermissions.includes(p)).includes(false)
                ? createResponse(res, 401)
                : next()
        } catch (err) { return next(err) }
    }
}

/**
 * A special case of permission checking.
 * Only allow note title and content edits if the user has the NOTE_EDIT_COMMON_PROPERTIES permission.
 * @param paramName the req.params field where the noteID is located; defaults to 'id'
 */
export const checkEditNotePermissions = (paramName: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = getAuthUser(res).id
            const notePermissions = getPermissionsFromRoles(await getNoteRoles(req.params[paramName], userID))

            if (notePermissions.includes(NotePermission.NOTE_EDIT_COMMON_PROPERTIES)) {
                return next()
            }
            if (notePermissions.includes(NotePermission.NOTE_EDIT_PERSONAL_PROPERTIES)) {
                delete req.body.title
                delete req.body.content
                return next()
            }
            return createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

const commentBelongsToUser = (
    note: INoteSchema,
    userID: IUserSchema['id'],
    commentID: ICommentSchema['id']
) => {
    return note.comments.items.find(c => c.subject.id === userID && c.id === commentID) !== undefined
}

/**
 * A special case of permission checking.
 * Only allow comment editing if the user is the creator of that comment.
 * @param noteIDParamName the req.params field where the noteID is located; defaults to 'id'
 * @param commentIDParamName the req.params field where the commentID is located; defaults to 'commentID'
 */
export const checkEditCommentPermissions = (
    noteIDParamName: string = 'id', commentIDParamName: string = 'commentID'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const noteID = req.params[noteIDParamName]
            const commentID = req.params[commentIDParamName]
            const userID = getAuthUser(res).id

            const note = await noteCrudQuery.getOneByID(noteID, userID)
            if (!note || !commentBelongsToUser(note, userID, commentID)) {
                return createResponse(res, 401)
            }

            return next()
        } catch (err) { return next(err) }
    }
}

/**
 * A special case of permission checking.
 * Only allow comment deletion if the user is the creator of that comment or it has the
 * COMMENT_DELETE permission for the note.
 * @param noteIDParamName the req.params field where the noteID is located; defaults to 'id'
 * @param commentIDParamName the req.params field where the commentID is located; defaults to 'commentID'
 */
export const checkDeleteCommentPermissions = (
    noteIDParamName: string = 'id', commentIDParamName: string = 'commentID'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const noteID = req.params[noteIDParamName]
            const commentID = req.params[commentIDParamName]
            const userID = getAuthUser(res).id

            const note = await noteCrudQuery.getOneByID(noteID, userID)
            if (!note) return createResponse(res, 401)

            const noteRoles = note.users.find(u => u.subject.id === userID)?.roles || []
            const notePermissions = getPermissionsFromRoles(noteRoles)

            if (commentBelongsToUser(note, userID, commentID) ||
            notePermissions.includes(NotePermission.COMMENT_DELETE)) {
                return next()
            }
            return createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export default checkNotePermissions
