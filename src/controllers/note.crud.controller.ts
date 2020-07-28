import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteQuery from '../queries/note.crud.query'
import { INoteBody } from '../models/Note'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'

const getOneNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const note = await noteQuery.getOneOwnByID(id, getAuthenticatedUser(res)?.userID)
        return note ? createResponse(res, 200, 'Note fetched.', { note })
            : createResponse(res, 400, 'Couldn\'t get note.')
    } catch (err) { return next(err) }
}

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collaborations } = req.query
        const notes = await noteQuery.getAllOwn(getAuthenticatedUser(res)?.userID)
        if (collaborations === 'true') {
            const collabNotes = await noteQuery.getAllCollab(
                getAuthenticatedUser(res)?.userID
            )
            return createResponse(res, 200, 'Notes fetched.', {
                notes,
                collaboratingNotes: collabNotes
            })
        }
        return createResponse(res, 200, 'Notes fetched.', { notes })
    } catch (err) { return next(err) }
}

const addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content, color } = req.body
        const newNote = await noteQuery.createNewNote({
            title,
            content,
            color,
            owner: getAuthenticatedUser(res)?.userID
        })
        return newNote
            ? createResponse(res, 201, 'Note created.', {
                note: newNote
            }) : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

const editNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const { title, content, archived, color } = req.body

        const note = await noteQuery.getOneOwnByID(id, getAuthenticatedUser(res)?.userID)
        if (note) {
            if (note.archived && (title || content || color)) {
                return createResponse(
                    res,
                    400,
                    'Cannot update fields on an archived note.'
                )
            }

            const newProps: INoteBody = {}
            if (title) newProps.title = title
            if (content) newProps.content = content
            if (archived) newProps.archived = archived
            if (color) newProps.color = color

            const newNote = await noteQuery.updateOneByID(
                id,
                getAuthenticatedUser(res)?.userID,
                newProps,
                false
            )
            if (newNote) {
                return createResponse(res, 200, 'Note updated.', {
                    note: newNote
                })
            }
            return createResponse(res, 400, 'Couldn\'t update note.')
        }
        const newProps: INoteBody = {}
        if (title) newProps.title = title
        if (content) newProps.content = content

        const newNote = await noteQuery.updateOneByID(
            id,
            getAuthenticatedUser(res)?.userID,
            newProps,
            true
        )
        return newNote
            ? createResponse(res, 200, 'Note updated.', {
                note: newNote
            }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.deleteOneOwn(id, getAuthenticatedUser(res)?.userID)
        return note ? createResponse(res, 200, 'Note deleted.')
            : createResponse(res, 400, 'Couldn\'t delete note.')
    } catch (err) { return next(err) }
}

const duplicateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.getOneOwnByID(id, getAuthenticatedUser(res)?.userID)
        if (!note) return createResponse(res, 400, 'Couldn\'t duplicate note.')

        const newNote = await noteQuery.createNewNote({
            title: note.title,
            content: note.content,
            color: note.color,
            archived: note.archived,
            owner: getAuthenticatedUser(res)?.userID
        })

        return newNote ? createResponse(res, 200, 'Note duplicated.')
            : createResponse(res, 400, 'Couldn\'t duplicate note.')
    } catch (err) { return next(err) }
}

export default { getOneNote, getAllNotes, addNote, editNote, deleteNote, duplicateNote }
