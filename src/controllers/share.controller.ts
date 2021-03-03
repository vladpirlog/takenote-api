import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteShareQuery from '../queries/note.share.query'
import noteCrudQuery from '../queries/note.crud.query'
import stringToBoolean from '../utils/stringToBoolean.util'
import createID from '../utils/createID.util'
import userQuery from '../queries/user.query'
import { CollaboratorBody } from '../types/RequestBodies'
import notepadShareQuery from '../queries/notepad.share.query'
import notepadCrudQuery from '../queries/notepad.crud.query'

const getNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const note = await noteShareQuery.getOneByShareCode(code)

        return note && note.share.active
            ? createResponse(res, 200, 'Note fetched.', { note: note.getPublicInfo() })
            : next()
    } catch (err) { return next(err) }
}

const getNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const notepadAndNotes = await notepadShareQuery.getOneByShareCode(code)
        if (!notepadAndNotes) return next()
        const { notepad, notes } = notepadAndNotes

        const publicNotepad = notepad.getPublicInfo()
        const publicNotes = notes.map(n => n.getPublicInfo())

        return notepad && notepad.share.active
            ? createResponse(res, 200, 'Notepad fetched.', {
                notepad: { ...publicNotepad, notes: publicNotes }
            })
            : next()
    } catch (err) { return next(err) }
}

const getShareLink = (entityType: 'note' | 'notepad') => {
    const shareQuery = entityType === 'note' ? noteShareQuery : notepadShareQuery

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { active, get_new: getNew } = req.query

            const entity = entityType === 'note'
                ? await noteCrudQuery.getOneByID(id)
                : (await notepadCrudQuery.getOneByID(id, false))?.notepad

            if (!entity) return next()

            // By default, the new active state will remain the same.
            let newActiveState: boolean = entity.share.active

            // If the 'active' query param exists and resolves to true or false, the new active state
            // becomes that value.
            const activeParam = stringToBoolean(active as string | undefined)
            if (activeParam !== undefined) {
                newActiveState = activeParam
            }

            // If the user does not request a new code and there is already one available,
            // the new share code stays the same.
            const newShareCode = getNew !== 'true' && entity.share.code
                ? entity.share.code : createID('share')

            const newEntity = await shareQuery.updateSharing(entity.id, {
                active: newActiveState, code: newShareCode
            })
            return newEntity
                ? createResponse(res, 200, 'Link fetched.', {
                    share: newEntity.share
                })
                : createResponse(res, 400)
        } catch (err) { return next(err) }
    }
}

const addCollaborator = (entityType: 'note' | 'notepad') => {
    const shareQuery = entityType === 'note' ? noteShareQuery : notepadShareQuery

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { user, type } = req.body as CollaboratorBody

            const collaborator = await userQuery.getByEmail(user)
            if (!collaborator || collaborator.id === req.session.userID) {
                return createResponse(res, 400)
            }

            const newEntity = await shareQuery.addCollaborator(
                id,
                { id: collaborator.id, email: collaborator.email },
                [type]
            )
            const newCollaborator = newEntity?.users.get(collaborator.id)
            if (!newCollaborator) return createResponse(res, 400)

            return createResponse(res, 200, 'Collaborator added.', {
                collaborator: { roles: newCollaborator.roles, subject: newCollaborator.subject }
            })
        } catch (err) { return next(err) }
    }
}

const deleteCollaborator = (entityType: 'note' | 'notepad', self: boolean = false) => {
    const shareQuery = entityType === 'note' ? noteShareQuery : notepadShareQuery

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session.userID) throw new Error('User not logged in.')
            const { id, collaboratorID } = req.params

            const newEntity = await shareQuery.deleteCollaborator(
                id,
                self ? req.session.userID : collaboratorID
            )
            return newEntity
                ? createResponse(res, 200, 'Collaborator deleted.')
                : createResponse(res, 400, 'Couldn\'t delete collaborator.')
        } catch (err) { return next(err) }
    }
}

export default {
    getNote,
    getNotepad,
    getNoteShareLink: getShareLink('note'),
    getNotepadShareLink: getShareLink('notepad'),
    addNoteCollaborator: addCollaborator('note'),
    addNotepadCollaborator: addCollaborator('notepad'),
    deleteNoteCollaborator: deleteCollaborator('note'),
    deleteNotepadCollaborator: deleteCollaborator('notepad'),
    deleteNoteSelfCollaborator: deleteCollaborator('note', true),
    deleteNotepadSelfCollaborator: deleteCollaborator('notepad', true)
}
