import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import randomString from '../utils/randomString.util'
import noteShareQuery from '../queries/note.share.query'
import noteCrudQuery from '../queries/note.crud.query'
import { PermissionLevel } from '../models/Permission'
import userQuery from '../queries/user.query'
import constants from '../config/constants'
import { INoteSchema } from '../models/Note'

const getNote = async (req: Request, res: Response) => {
    try {
        const { code } = req.params
        const note = await noteCrudQuery.getOneByShareCode(code)

        return note && note.share.active
            ? createResponse(res, 200, 'Note fetched.', { note })
            : createResponse(res, 400, 'Couldn\'t get note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const updateShareField = (
    res: Response,
    note: INoteSchema,
    newActive: INoteSchema['share']['active'],
    newCode: INoteSchema['share']['code']
) => {
    return noteCrudQuery.updateOneByID(
        note.id,
        res.locals.user.userID,
        { share: { active: newActive, code: newCode } },
        false
    )
}

const getShareLink = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params
        const { active, get_new: getNew } = req.query

        const note = await noteCrudQuery.getOneOwnByID(id, res.locals.user.userID)
        if (!note) return createResponse(res, 400, 'Couldn\'t get note.')

        if (getNew !== 'true' && note.share.code) {
            const newActiveState = active === 'true' && !note.share.active
                ? true : active === 'false' && note.share.active
                    ? false : null

            if (newActiveState !== null) {
                await updateShareField(res, note, newActiveState, note.share.code)
            }

            return createResponse(res, 200, 'Link fetched.', {
                shareURL: note.getShareURL()
            })
        }

        const newActiveState = active === 'true' ? true
            : active === 'false' ? false : note.share.active
        const newNote = await updateShareField(
            res,
            note,
            newActiveState,
            randomString(constants.sharing.codeLength)
        )

        return newNote ? createResponse(res, 200, 'Link fetched.', {
            shareURL: newNote.getShareURL()
        }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
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

        const permissionLevel = type === 'r'
            ? PermissionLevel.read : type === 'rw'
                ? PermissionLevel.readWrite : null
        if (permissionLevel === null) {
            return createResponse(res, 400, "Invalid type. Should be 'r' or 'rw'.")
        }
        const newNote = await noteShareQuery.addPermission(
            id,
            res.locals.user.userID,
            { subject: collabUser.id, level: permissionLevel }
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator added.', {
                permission: newNote.permissions[newNote.permissions.length - 1]
            }) : createResponse(res, 400, 'Couldn\'t add collaborator.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const deleteCollaborator = async (
    req: Request,
    res: Response
) => {
    try {
        const { id, permissionID } = req.params

        const newNote = await noteShareQuery.deletePermission(
            id,
            res.locals.user.userID,
            permissionID
        )
        return newNote
            ? createResponse(res, 200, 'Collaborator deleted.')
            : createResponse(res, 400, 'Couldn\'t delete collaborator.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default { getNote, getShareLink, addCollaborator, deleteCollaborator }
