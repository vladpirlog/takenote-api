import { Request, Response, NextFunction } from 'express'
import { NoteRole } from '../models/Note'
import getNoteRole from '../queries/getNoteRole.query'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'

/**
 * Higher-order function that verifies if the user has one of
 * the required permissions for a given note.
 * @param roles an array of NoteRole elements; the user has to have one of these roles
 */
const checkNoteRole = (roles: NoteRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const userID = getAuthUser(res).id

            const noteRole = await getNoteRole(id, userID)

            return noteRole && roles.includes(noteRole)
                ? next()
                : createResponse(res, 401)
        } catch (err) { return next(err) }
    }
}

export default checkNoteRole
