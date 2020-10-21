import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteShareQuery from '../queries/note.share.query'
import noteCrudQuery from '../queries/note.crud.query'
import stringToBoolean from '../utils/stringToBoolean.util'
import createID from '../utils/createID.util'
import getAuthUser from '../utils/getAuthUser.util'
import { INoteSchema, NoteRole } from '../models/Note'

const getNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const note = await noteCrudQuery.getOneByShareCode(code)

        return note && note.share.active
            ? createResponse(res, 200, 'Note fetched.', { note: note.getPublicInfo() })
            : next()
    } catch (err) { return next(err) }
}

const getShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query
        const note = await noteCrudQuery.getOneByID(id, getAuthUser(res).id)
        if (!note) return next()

        // By default, the new active state will remain the same.
        let newActiveState: INoteSchema['share']['active'] = note.share.active

        // If the 'active' query param exists and resolves to true or false, the new active state
        // becomes that value.
        const activeParamResolved = stringToBoolean(active as string | undefined)
        if (activeParamResolved !== undefined) {
            newActiveState = activeParamResolved
        }

        // If the user does not request a new code and there is already one available,
        // the new share code stays the same.
        const newShareCode = getNew !== 'true' && note.share.code
            ? note.share.code : createID('share')

        const newNote = await noteShareQuery.updateSharing(
            note.id, getAuthUser(res).id, {
                active: newActiveState,
                code: newShareCode
            })
        return newNote ? createResponse(res, 200, 'Link fetched.', {
            share: newNote.share
        }) : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const addCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { user, type } = req.body

        if (type !== 'rw' && type !== 'r') {
            return createResponse(res, 400, 'Invalid type. Should be \'r\' or \'rw\'.')
        }

        const newNote = await noteShareQuery.addCollaborator(
            id,
            getAuthUser(res).id,
            user,
            type === 'rw' ? NoteRole.EDITOR : NoteRole.VIEWER
        )
        const newCollaborator = newNote?.users
            .find(u => u.subject.email === user || u.subject.username === user)
        if (!newNote || !newCollaborator) return createResponse(res, 400)

        return createResponse(res, 200, 'Collaborator added.', {
            collaborator: { role: newCollaborator.role, subject: newCollaborator.subject }
        })
    } catch (err) { return next(err) }
}

const deleteCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, collaboratorID } = req.params

        const newNote = await noteShareQuery.deleteCollaborator(
            id,
            getAuthUser(res).id,
            collaboratorID
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator deleted.')
            : createResponse(res, 400, 'Couldn\'t delete collaborator.')
    } catch (err) { return next(err) }
}

export default { getNote, getShareLink, addCollaborator, deleteCollaborator }
