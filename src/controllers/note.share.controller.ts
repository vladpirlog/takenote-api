import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteShareQuery from '../queries/note.share.query'
import noteCrudQuery from '../queries/note.crud.query'
import { PermissionLevel } from '../models/Permission'
import userQuery from '../queries/user.query'
import stringToBoolean from '../utils/stringToBoolean.util'
import createID from '../utils/createID.util'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'
import checkNoteLimits from '../utils/checkNoteLimits.util'
import { INoteSchema } from '../models/Note'

const getNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const note = await noteCrudQuery.getOneByShareCode(code)

        return note && note.share.active
            ? createResponse(res, 200, 'Note fetched.', { note })
            : createResponse(res, 400, 'Couldn\'t get note.')
    } catch (err) { return next(err) }
}

const getShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query
        const note = await noteCrudQuery.getOneOwnByID(id, getAuthenticatedUser(res)?.userID)
        if (!note) return createResponse(res, 400, 'Couldn\'t get note.')

        // By default, the new active state will remain the same.
        let newActiveState: INoteSchema['share']['active'] = note.share.active

        // If the 'active' query param exists and resolves to true of false, the new active state
        // becomes that value.
        const activeParamResolved = stringToBoolean(active as string || '')
        if (activeParamResolved !== null) {
            newActiveState = activeParamResolved
        }

        // If the user does not request a new code and there is already one available,
        // the new share code stays the same.
        const newShareCode = getNew !== 'true' && note.share.code
            ? note.share.code : createID('share')

        const newNote = await noteCrudQuery.updateOneByID(
            note.id, getAuthenticatedUser(res)?.userID, {
                share: {
                    active: newActiveState,
                    code: newShareCode
                }
            }, false)
        return newNote ? createResponse(res, 200, 'Link fetched.', {
            shareURL: newNote.getShareURL()
        }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const addCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { user, type } = req.body
        const collabUser = await userQuery.getByUsernameOrEmail(user)
        if (!collabUser) { return createResponse(res, 400, 'Couldn\'t add collaborator.') }

        const permissionLevel = type === 'r'
            ? PermissionLevel.read : type === 'rw'
                ? PermissionLevel.readWrite : null
        if (permissionLevel === null) {
            return createResponse(res, 400, "Invalid type. Should be 'r' or 'rw'.")
        }
        if (!await checkNoteLimits.forPermission(id, getAuthenticatedUser(res)?.userID)) {
            return createResponse(res, 400, 'Collaborators limit exceeded.')
        }
        const newNote = await noteShareQuery.addPermission(
            id,
            getAuthenticatedUser(res)?.userID,
            { subject: collabUser.id, level: permissionLevel }
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator added.', {
                permission: newNote.permissions[newNote.permissions.length - 1]
            }) : createResponse(res, 400, 'Couldn\'t add collaborator.')
    } catch (err) { return next(err) }
}

const deleteCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, permissionID } = req.params

        const newNote = await noteShareQuery.deletePermission(
            id,
            getAuthenticatedUser(res)?.userID,
            permissionID
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator deleted.')
            : createResponse(res, 400, 'Couldn\'t delete collaborator.')
    } catch (err) { return next(err) }
}

export default { getNote, getShareLink, addCollaborator, deleteCollaborator }
