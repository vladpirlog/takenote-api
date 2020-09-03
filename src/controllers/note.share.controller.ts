import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteShareQuery from '../queries/note.share.query'
import noteCrudQuery from '../queries/note.crud.query'
import { PermissionLevel } from '../models/Permission'
import userQuery from '../queries/user.query'
import stringToBoolean from '../utils/stringToBoolean.util'
import createID from '../utils/createID.util'
import getAuthUser from '../utils/getAuthUser.util'
import checkLimits from '../utils/checkLimits.util'
import { INoteSchema } from '../models/Note'

const getNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.params
        const note = await noteCrudQuery.getOneByShareCode(code)

        return note && note.share.active
            ? createResponse(res, 200, 'Note fetched.', { note })
            : next()
    } catch (err) { return next(err) }
}

const getShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query
        const note = await noteCrudQuery.getOneByID(id, getAuthUser(res)?._id)
        if (!note) return next()

        // By default, the new active state will remain the same.
        let newActiveState: INoteSchema['share']['active'] = note.share.active

        // If the 'active' query param exists and resolves to true or false, the new active state
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
            note.id, getAuthUser(res)?._id, {
                share: {
                    active: newActiveState,
                    code: newShareCode
                }
            }, false)
        return newNote ? createResponse(res, 200, 'Link fetched.', {
            share: newNote.share
        }) : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const addCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { user, type } = req.body
        const collabUser = await userQuery.getByUsernameOrEmail(user)
        if (!collabUser) return createResponse(res, 400)

        const permissionLevel = type === 'r'
            ? PermissionLevel.read : type === 'rw'
                ? PermissionLevel.readWrite : null
        if (permissionLevel === null) {
            return createResponse(res, 400, 'Invalid type. Should be \'r\' or \'rw\'.')
        }
        if (!(await checkLimits.forPermission(id, getAuthUser(res)?._id))) {
            return createResponse(res, 400)
        }
        const newNote = await noteShareQuery.addPermission(
            id,
            getAuthUser(res)?._id,
            {
                subject: {
                    _id: collabUser.id, username: collabUser.username, email: collabUser.email
                },
                level: permissionLevel
            }
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator added.', {
                permission: newNote.permissions.find(p => p.subject._id === collabUser.id)
            }) : createResponse(res, 400)
    } catch (err) { return next(err) }
}

const deleteCollaborator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, permissionID } = req.params

        const newNote = await noteShareQuery.deletePermission(
            id,
            getAuthUser(res)?._id,
            permissionID
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator deleted.')
            : createResponse(res, 400, 'Couldn\'t delete collaborator.')
    } catch (err) { return next(err) }
}

export default { getNote, getShareLink, addCollaborator, deleteCollaborator }
