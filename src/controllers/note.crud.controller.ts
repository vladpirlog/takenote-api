import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import noteQuery from '../queries/note.crud.query'
import { INoteBody } from '../models/Note'

const getOneNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const note = await noteQuery.getOneOwnByID(id, res.locals.user.userID)
        return note ? createResponse(res, 200, 'Note fetched.', { note })
            : createResponse(res, 400, 'Couldn\'t get note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const getAllNotes = async (req: Request, res: Response) => {
    try {
        const { collaborations } = req.query
        const notes = await noteQuery.getAllOwn(res.locals.user.userID)
        if (collaborations === 'true') {
            const collabNotes = await noteQuery.getAllCollab(
                res.locals.user.userID
            )
            return createResponse(res, 200, 'Notes fetched.', {
                notes,
                collaboratingNotes: collabNotes
            })
        }
        return createResponse(res, 200, 'Notes fetched.', { notes })
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const addNote = async (req: Request, res: Response) => {
    try {
        const { title, content, color } = req.body
        const newNote = await noteQuery.createNewNote({
            title,
            content,
            color,
            owner: res.locals.user.userID
        })
        return newNote
            ? createResponse(res, 201, 'Note created.', {
                note: newNote
            }) : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const editNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { title, content, archived, color } = req.body

        const note = await noteQuery.getOneOwnByID(id, res.locals.user.userID)
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

            const newNote = await noteQuery.updateOneOwnOrCollabByID(
                id,
                res.locals.user.userID,
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

        const newNote = await noteQuery.updateOneOwnOrCollabByID(
            id,
            res.locals.user.userID,
            newProps,
            true
        )
        return newNote
            ? createResponse(res, 200, 'Note updated.', {
                note: newNote
            }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const note = await noteQuery.deleteOneOwn(id, res.locals.user.userID)
        return note ? createResponse(res, 200, 'Note deleted.')
            : createResponse(res, 400, 'Couldn\'t delete note.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default { getOneNote, getAllNotes, addNote, editNote, deleteNote }
