import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import noteCrudQuery from '../queries/note.crud.query'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'
import { ICommentSchema } from '../types/Comment'
import { Permission } from '../enums/Permission.enum'
import { getRolesOfNote, getRolesOfNotepad } from '../queries/getRoles.query'
import { getPermissionsFromRoles } from '../utils/accessManagement.util'

/**
 * Higher-order function that verifies if the user has at least one of the required permissions for a given entity.
 * @param type the type of entity to be verified
 * @param permissionList an array of Permission elements
 * @param paramName the req.params field where the accessed entity id is located; defaults to 'id'
 */
const checkPermissions = (type: 'note' | 'notepad', permissionList: Permission[], paramName: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const entityID = req.params[paramName]
            const roleArray = type === 'note'
                ? await getRolesOfNote(getAuthUser(res).id, entityID)
                : await getRolesOfNotepad(getAuthUser(res).id, entityID)
            const userPermissions = getPermissionsFromRoles(type, roleArray)

            const hasAtLeastOneRequiredPermission = permissionList
                .map(p => userPermissions.includes(p))
                .includes(true)

            return hasAtLeastOneRequiredPermission ? next() : createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export const checkNotePermissions = (
    permissionList: Permission[],
    paramName: string = 'id'
) => checkPermissions('note', permissionList, paramName)

export const checkNotepadPermissions = (
    permissionList: Permission[],
    paramName: string = 'id'
) => checkPermissions('notepad', permissionList, paramName)

/**
 * A special case of permission checking.
 * Only allow note title and content edits if the user has the `NOTE_EDIT_COMMON_PROPERTIES` permission.
 * @param paramName the req.params field where the accessed noteID is located; defaults to 'id'
 */
export const checkEditNotePermissions = (paramName: string = 'id') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const noteID = req.params[paramName]
            const roleArray = await getRolesOfNote(getAuthUser(res).id, noteID)
            const permArray = getPermissionsFromRoles('note', roleArray)

            const canEditCommonProperties = permArray.includes(Permission.NOTE_EDIT_COMMON_PROPERTIES)
            const canEditPersonalProperties = permArray.includes(Permission.NOTE_EDIT_PERSONAL_PROPERTIES)
            if (!canEditCommonProperties && !canEditPersonalProperties) {
                return createResponse(res, 401)
            }
            if (!canEditCommonProperties) {
                delete req.body.title
                delete req.body.content
            } else if (!canEditPersonalProperties) {
                delete req.body.archived
                delete req.body.fixed
                delete req.body.color
            }
            return next()
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

            const note = await noteCrudQuery.getOneByID(noteID)
            if (note && commentBelongsToUser(note, getAuthUser(res).id, commentID)) {
                return next()
            }
            return createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

/**
 * A special case of permission checking.
 * Only allow comment deletion if the user is the creator of that comment or it has the
 * `NOTE_COMMENT_DELETE` permission for the note.
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

            const note = await noteCrudQuery.getOneByID(noteID)
            if (!note) return createResponse(res, 401)

            const roleArray = note.users.get(userID)?.roles || []
            const permArray = getPermissionsFromRoles('note', roleArray)

            const canDeleteComment = commentBelongsToUser(note, userID, commentID) ||
                permArray.includes(Permission.NOTE_COMMENT_DELETE)

            if (canDeleteComment) return next()
            return createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export const checkNoteMovingPermissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const noteID = req.params.id
        const notepadID = req.query.to as string
        const userID = getAuthUser(res).id

        const notePermArray = getPermissionsFromRoles('note', await getRolesOfNote(userID, noteID))

        if (notepadID === 'default') {
            const canMoveNote = notePermArray.includes(Permission.NOTE_MOVE)
            return canMoveNote ? next() : createResponse(res, 401)
        }

        const notepadPermArray = getPermissionsFromRoles('notepad', await getRolesOfNotepad(userID, notepadID))

        const canMoveNote = notePermArray.includes(Permission.NOTE_MOVE) &&
            notepadPermArray.includes(Permission.NOTEPAD_ADD_NOTES)

        return canMoveNote ? next() : createResponse(res, 401)
    } catch (err) { return next(err) }
}
