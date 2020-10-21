import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteQuery from '../queries/note.crud.query'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'
import isPositiveInteger from '../utils/isPositiveInteger.util'
import User from '../models/User'
import userQuery from '../queries/user.query'

const getOneNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const note = await noteQuery.getOneByID(id, getAuthUser(res).id)
        return note ? createResponse(res, 200, 'Note fetched.', {
            note: note.getPublicInfo(getAuthUser(res).id)
        }) : createResponse(res)
    } catch (err) { return next(err) }
}

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collaborations, skip, limit, archived } = req.query

        if (skip && !isPositiveInteger(skip as string)) {
            return createResponse(res, 422, 'The skip param is invalid.')
        }

        if (limit && !isPositiveInteger(limit as string)) {
            return createResponse(res, 422, 'The limit param is invalid.')
        }

        const notes = await noteQuery.getAll(
            getAuthUser(res).id,
            skip ? parseInt(skip as string) : undefined,
            limit ? parseInt(limit as string) : undefined,
            stringToBoolean(collaborations as string | undefined),
            stringToBoolean(archived as string | undefined)
        )

        return createResponse(res, 200, 'Notes fetched.', {
            notes: notes.map(n => n.getPublicInfo(getAuthUser(res).id))
        })
    } catch (err) { return next(err) }
}

const addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, archived, color, fixed } = req.body

        const authUser = await User.findOne({ id: getAuthUser(res).id })
        if (!authUser) return createResponse(res, 400)
        const newNote = await noteQuery.createOne({
            title,
            content,
            archived: stringToBoolean(archived),
            color,
            fixed: stringToBoolean(fixed),
            owner: { id: authUser.id, username: authUser.username, email: authUser.email }
        })
        return newNote
            ? createResponse(res, 201, 'Note created.', {
                note: newNote.getPublicInfo(getAuthUser(res).id)
            }) : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

const editNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title, content, archived, color, fixed } = req.body

        const updatedNote = await noteQuery.updateOneByID(
            id,
            getAuthUser(res).id,
            {
                title,
                content,
                archived: stringToBoolean(archived),
                color,
                fixed: stringToBoolean(fixed)
            }
        )

        return updatedNote
            ? createResponse(res, 200, 'Note updated.', {
                note: updatedNote.getPublicInfo(getAuthUser(res).id)
            }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.deleteOneByID(id, getAuthUser(res).id)
        return note ? createResponse(res, 200, 'Note deleted.')
            : createResponse(res, 400, 'Couldn\'t delete note.')
    } catch (err) { return next(err) }
}

const duplicateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.getOneByID(id, getAuthUser(res).id)
        const authUser = await userQuery.getById(getAuthUser(res).id)
        if (!note || !authUser) return createResponse(res, 400, 'Couldn\'t duplicate note.')

        const notePublicInfo = note.getPublicInfo(authUser.id)

        const newNote = await noteQuery.createOne(
            {
                title: notePublicInfo.title,
                content: notePublicInfo.content,
                archived: notePublicInfo.archived,
                color: notePublicInfo.color,
                fixed: notePublicInfo.fixed,
                owner: notePublicInfo.owner
            }
        )

        return newNote ? createResponse(res, 200, 'Note duplicated.', {
            note: newNote.getPublicInfo(getAuthUser(res).id)
        }) : createResponse(res, 400, 'Couldn\'t duplicate note.')
    } catch (err) { return next(err) }
}

export default { getOneNote, getAllNotes, addNote, editNote, deleteNote, duplicateNote }
