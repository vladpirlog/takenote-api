import { NextFunction, Request, Response } from 'express'
import noteCrudQuery from '../queries/note.crud.query'
import notepadCrudQuery from '../queries/notepad.crud.query'
import userQuery from '../queries/user.query'
import { NoteBody } from '../types/RequestBodies'
import createResponse from '../utils/createResponse.util'
import getAuthUser from '../utils/getAuthUser.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getOneNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { include_notes: includeNotes } = req.query

        const includeNotesParam = stringToBoolean(includeNotes as string | undefined)
        const noteAndNotepads = await notepadCrudQuery.getOneByID(id, includeNotesParam)
        if (!noteAndNotepads) return next()
        const { notepad, notes } = noteAndNotepads

        const publicNotepad = notepad.getPublicInfo(res)
        const publicNotes = notes.map(n => n.getPublicInfo(res))

        return notepad
            ? createResponse(res, 200, 'Notepad fetched.', {
                notepad: { ...publicNotepad, notes: publicNotes }
            })
            : createResponse(res)
    } catch (err) { return next(err) }
}

const getAllNotepads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collaborations, skip, limit, include_notes: includeNotes } = req.query

        const skipParam = skip ? parseInt(skip as string) : undefined
        const limitParam = limit ? parseInt(limit as string) : undefined
        const collaborationsParam = stringToBoolean(collaborations as string | undefined)
        const includeNotesParam = stringToBoolean(includeNotes as string | undefined)

        const notepadsAndNotes = await notepadCrudQuery.getAll(
            getAuthUser(res).id,
            skipParam,
            limitParam,
            collaborationsParam,
            includeNotesParam
        )
        const publicNotepads = notepadsAndNotes.map(({ notepad, notes }) => {
            const publicNotepad = notepad.getPublicInfo(res)
            const publicNotes = notes.map(n => n.getPublicInfo(res))
            return { ...publicNotepad, notes: publicNotes }
        })

        return createResponse(res, 200, 'Notepads fetched.', {
            notepads: publicNotepads
        })
    } catch (err) { return next(err) }
}

const addNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body

        const authUser = await userQuery.getById(getAuthUser(res).id)
        if (!authUser) return createResponse(res, 400)

        const notepad = await notepadCrudQuery.createOne({
            title,
            owner: {
                id: authUser.id, username: authUser.username, email: authUser.email
            }
        })

        return notepad
            ? createResponse(res, 201, 'Notepad created.', {
                notepad: notepad.getPublicInfo(res)
            })
            : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

const editNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title } = req.body

        const notepad = await notepadCrudQuery.updateOneByID(id, { title })

        return notepad
            ? createResponse(res, 200, 'Notepad updated.', {
                notepad: notepad.getPublicInfo(res)
            })
            : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const notepad = await notepadCrudQuery.deleteOneByID(id)
        return notepad
            ? createResponse(res, 200, 'Notepad deleted.')
            : createResponse(res, 400, 'Couldn\'t delete notepad.')
    } catch (err) { return next(err) }
}

const addNoteInNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title, content, archived, color, fixed } = req.body as NoteBody

        const archivedParam = typeof archived === 'string' ? stringToBoolean(archived) : archived
        const fixedParam = typeof fixed === 'string' ? stringToBoolean(fixed) : fixed

        const newNoteProps = {
            title,
            content,
            archived: archivedParam,
            color,
            fixed: fixedParam
        }

        const newNote = await noteCrudQuery.createOneInNotepad(getAuthUser(res).id, id, newNoteProps)
        return newNote
            ? createResponse(res, 201, 'Note created and added to notepad.', {
                note: newNote.getPublicInfo(res)
            })
            : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

export default {
    getOneNotepad,
    getAllNotepads,
    addNotepad,
    editNotepad,
    deleteNotepad,
    addNoteInNotepad
}
