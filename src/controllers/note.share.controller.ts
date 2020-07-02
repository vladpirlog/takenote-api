import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import randomString from '../utils/randomString.util'
import noteQuery from '../queries/note.query'
import { IPermissionSchema, PermissionLevel } from '../models/Permission'
import userQuery from '../queries/user.query'
import constants from '../config/constants'

const getNote = async (req: Request, res: Response) => {
    try {
        const { code } = req.params
        const note = await noteQuery.getOneByShareCode(code)
        if (!note || !note.share.active) { return createResponse(res, 400, 'Couldn\'t get note.') }

        return createResponse(res, 200, 'Note fetched.', { note })
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

const getShareLink = async (
    req: Request,
    res: Response

) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query

        const note = await noteQuery.getOneOwnByID(id, res.locals.user.userID)
        if (!note) return createResponse(res, 400, 'Couldn\'t get note.')

        if (getNew !== 'true' && note.share.code) {
            if (active === 'true' && !note.share.active) {
                await noteQuery.updateOneOwnOrCollabByID(
                    id,
                    res.locals.user.userID,
                    { share: { active: true, code: note.share.code } },
                    false
                )
            } else if (active === 'false' && note.share.active) {
                await noteQuery.updateOneOwnOrCollabByID(
                    id,
                    res.locals.user.userID,
                    { share: { active: false, code: note.share.code } },
                    false
                )
            }

            return createResponse(res, 200, 'Link fetched.', {
                shareURL: note.getShareURL()
            })
        }

        const newNote = await noteQuery.updateOneOwnOrCollabByID(
            id,
            res.locals.user.userID,
            {
                share: {
                    active:
            active === 'true'
                ? true
                : active === 'false'
                    ? false
                    : note.share.active,
                    code: randomString(constants.sharing.codeLength)
                }
            },
            false
        )

        if (!newNote) return createResponse(res, 400, 'Couldn\'t update note.')

        return createResponse(res, 200, 'Link fetched.', {
            shareURL: newNote.getShareURL()
        })
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

const addCollaborator = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params
        const { user, type } = req.body
        const collabUser = await userQuery.getByUsernameEmailOrId(user)
        if (!collabUser) { return createResponse(res, 400, 'Couldn\'t add collaborator.') }

        let permissionLevel: IPermissionSchema['level']
        if (type === 'r') permissionLevel = PermissionLevel.read
        else if (type === 'rw') permissionLevel = PermissionLevel.readWrite
        else {
            return createResponse(
                res,
                400,
                "Invalid type. Should be 'r' or 'rw'."
            )
        }

        const newNote = await noteQuery.addPermission(
            id,
            res.locals.user.userID,
            { subject: collabUser.id, level: permissionLevel }
        )
        if (!newNote) { return createResponse(res, 400, 'Couldn\'t add collaborator.') }

        return createResponse(res, 200, 'Collaborator added.', {
            permission: newNote.permissions[newNote.permissions.length - 1]
        })
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

const deleteCollaborator = async (
    req: Request,
    res: Response

) => {
    try {
        const { id, permissionID } = req.params

        const newNote = await noteQuery.deletePermission(
            id,
            res.locals.user.userID,
            permissionID
        )
        if (!newNote) { return createResponse(res, 400, 'Couldn\'t delete collaborator.') }
        return createResponse(res, 200, 'Collaborator deleted.')
    } catch (err) {
        return createResponse(res, 500, err.message, {
            error: err
        })
    }
}

export default { getNote, getShareLink, addCollaborator, deleteCollaborator }
