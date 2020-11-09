import { NextFunction, Request, Response } from 'express'
import notepadCrudQuery from '../queries/notepad.crud.query'
import notepadShareQuery from '../queries/notepad.share.query'
import userQuery from '../queries/user.query'
import { INotepadSchema } from '../types/Notepad'
import { CollaboratorBody } from '../types/RequestBodies'
import createID from '../utils/createID.util'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const notepadAndNotes = await notepadShareQuery.getOneByShareCode(code)
        if (!notepadAndNotes) return next()
        const { notepad, notes } = notepadAndNotes

        const publicNotepad = notepad.getPublicInfo(res, true)
        const publicNotes = notes.map(n => n.getPublicInfo(res, true))

        return notepad && notepad.share.active
            ? createResponse(res, 200, 'Notepad fetched.', {
                notepad: { ...publicNotepad, notes: publicNotes }
            })
            : next()
    } catch (err) { return next(err) }
}

const getShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query
        const notepadAndNotes = await notepadCrudQuery.getOneByID(id)
        if (!notepadAndNotes) return next()
        const { notepad } = notepadAndNotes

        // By default, the new active state will remain the same.
        let newActiveState: INotepadSchema['share']['active'] = notepad.share.active

        // If the 'active' query param exists and resolves to true or false, the new active state
        // becomes that value.
        const activeParamResolved = stringToBoolean(active as string | undefined)
        if (activeParamResolved !== undefined) {
            newActiveState = activeParamResolved
        }

        // If the user does not request a new code and there is already one available,
        // the new share code stays the same.
        const newShareCode = getNew !== 'true' && notepad.share.code
            ? notepad.share.code : createID('share')

        const newNotepad = await notepadShareQuery.updateSharing(notepad.id, {
            active: newActiveState, code: newShareCode
        })
        return newNotepad
            ? createResponse(res, 200, 'Link fetched.', {
                share: newNotepad.share
            })
            : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const addCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { user, type } = req.body as CollaboratorBody

        const collaborator = await userQuery.getByUsernameOrEmail(user)
        if (!collaborator || collaborator.id === getAuthUser(res).id) {
            return createResponse(res, 400)
        }

        const newNotepad = await notepadShareQuery.addCollaborator(
            id,
            { id: collaborator.id, username: collaborator.username, email: collaborator.email },
            [type]
        )
        const newCollaborator = newNotepad?.users.get(collaborator.id)
        if (!newNotepad || !newCollaborator) return createResponse(res, 400)

        return createResponse(res, 200, 'Collaborator added.', {
            collaborator: { roles: newCollaborator.roles, subject: newCollaborator.subject }
        })
    } catch (err) { return next(err) }
}

const deleteCollaborator = (self: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, collaboratorID } = req.params

            const newNotepad = await notepadShareQuery.deleteCollaborator(
                id,
                self ? getAuthUser(res).id : collaboratorID
            )
            return newNotepad
                ? createResponse(res, 200, 'Collaborator deleted.')
                : createResponse(res, 400, 'Couldn\'t delete collaborator.')
        } catch (err) { return next(err) }
    }
}

export default {
    getNotepad,
    getShareLink,
    addCollaborator,
    deleteCollaborator: deleteCollaborator(),
    deleteSelfCollaborator: deleteCollaborator(true)
}
