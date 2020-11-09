import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteCrudQuery from '../queries/note.crud.query'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'
import userQuery from '../queries/user.query'
import { NoteBody } from '../types/RequestBodies'

const getOneNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const note = await noteCrudQuery.getOneByID(id)
        return note
            ? createResponse(res, 200, 'Note fetched.', {
                note: note.getPublicInfo(res)
            })
            : next()
    } catch (err) { return next(err) }
}

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collaborations, skip, limit, archived } = req.query

        const skipParam = skip ? parseInt(skip as string) : undefined
        const limitParam = limit ? parseInt(limit as string) : undefined
        const collaborationsParam = stringToBoolean(collaborations as string | undefined)
        const archivedParam = stringToBoolean(archived as string | undefined)

        const notes = await noteCrudQuery.getAll(
            getAuthUser(res).id,
            skipParam,
            limitParam,
            collaborationsParam,
            archivedParam
        )

        return createResponse(res, 200, 'Notes fetched.', {
            notes: notes.map(n => n.getPublicInfo(res))
        })
    } catch (err) { return next(err) }
}

const addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, archived, color, fixed } = req.body as NoteBody
        const authUser = await userQuery.getById(getAuthUser(res).id)
        if (!authUser) return createResponse(res, 400)

        const archivedParam = typeof archived === 'string' ? stringToBoolean(archived) : archived
        const fixedParam = typeof fixed === 'string' ? stringToBoolean(fixed) : fixed

        const newNote = await noteCrudQuery.createOne({
            title,
            content,
            archived: archivedParam,
            color,
            fixed: fixedParam,
            owner: { id: authUser.id, username: authUser.username, email: authUser.email }
        })
        return newNote
            ? createResponse(res, 201, 'Note created.', {
                note: newNote.getPublicInfo(res)
            }) : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

const editNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title, content, archived, color, fixed } = req.body as NoteBody

        const archivedParam = typeof archived === 'string' ? stringToBoolean(archived) : archived
        const fixedParam = typeof fixed === 'string' ? stringToBoolean(fixed) : fixed

        const updatedNote = await noteCrudQuery.updateOneByID(
            id,
            getAuthUser(res).id,
            {
                title,
                content,
                archived: archivedParam,
                color,
                fixed: fixedParam
            }
        )

        return updatedNote
            ? createResponse(res, 200, 'Note updated.', {
                note: updatedNote.getPublicInfo(res)
            })
            : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteCrudQuery.deleteOneByID(id)
        return note
            ? createResponse(res, 200, 'Note deleted.')
            : createResponse(res, 400, 'Couldn\'t delete note.')
    } catch (err) { return next(err) }
}

const duplicateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteCrudQuery.getOneByID(id)
        const authUser = await userQuery.getById(getAuthUser(res).id)
        if (!note || !authUser) return createResponse(res, 400, 'Couldn\'t duplicate note.')

        const notePublicInfo = note.getPublicInfo(res)
        const newNote = await noteCrudQuery.createOne(
            {
                title: notePublicInfo.title,
                content: notePublicInfo.content,
                archived: notePublicInfo.archived,
                color: notePublicInfo.color,
                fixed: notePublicInfo.fixed,
                owner: {
                    id: authUser.id, username: authUser.username, email: authUser.email
                }
            }
        )

        return newNote
            ? createResponse(res, 200, 'Note duplicated.', {
                note: newNote.getPublicInfo(res)
            })
            : createResponse(res, 400, 'Couldn\'t duplicate note.')
    } catch (err) { return next(err) }
}

const moveNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { to } = req.query

        const destinationNotepadID = to === 'default' ? undefined : (to as string)

        const note = await noteCrudQuery.moveOne(id, getAuthUser(res).id, destinationNotepadID)
        return note
            ? createResponse(res, 200, 'Note moved.')
            : createResponse(res, 400, 'Couldn\'t move note.')
    } catch (err) { return next(err) }
}

export default {
    getOneNote,
    getAllNotes,
    addNote,
    editNote,
    deleteNote,
    duplicateNote,
    moveNote
}
