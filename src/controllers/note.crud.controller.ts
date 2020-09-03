import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteQuery from '../queries/note.crud.query'
import getAuthUser from '../utils/getAuthUser.util'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import checkLimits from '../utils/checkLimits.util'
import stringToBoolean from '../utils/stringToBoolean.util'
import { INoteBody } from '../models/Note'

const getOneNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const note = await noteQuery.getOneByID(id, getAuthUser(res)?._id)
        return note ? createResponse(res, 200, 'Note fetched.', { note })
            : next()
    } catch (err) { return next(err) }
}

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { collaborations, skip, limit, archived } = req.query

        const archivedOption = archived ? stringToBoolean(archived as string) : null

        const skipOption = parseInt(skip as string, 10)
        const limitOption = parseInt(limit as string, 10)

        if (limitOption && (limitOption < 0 || !Number.isSafeInteger(limitOption))) {
            return createResponse(res, 422, 'The limit param is invalid.')
        }

        if (skipOption && (skipOption < 0 || !Number.isSafeInteger(skipOption))) {
            return createResponse(res, 422, 'The skip param is invalid.')
        }

        const notes = await noteQuery.getAllOwn(
            getAuthUser(res)?._id,
            archivedOption,
            skipOption,
            limitOption
        )
        if (collaborations === 'true') {
            const collabNotes = await noteQuery.getAllCollab(
                getAuthUser(res)?._id
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
        if (!(await checkLimits.forNote(getAuthUser(res)?._id))) {
            return createResponse(res, 400, 'Notes limit exceeded.')
        }
        const newNote = await noteQuery.createNewNote({
            title,
            content,
            color,
            owner: getAuthUser(res)?._id
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

        const note = await noteQuery.getOneByID(id, getAuthUser(res)?._id)
        if (!note) {
            return createResponse(res, 400, 'Couldn\'t update note.')
        }

        let fieldsToUpdate: INoteBody
        let forCollabNote: boolean

        if (note.owner === getAuthUser(res)?._id) {
            fieldsToUpdate = removeUndefinedProps({ title, content, archived, color })
            forCollabNote = false
        } else {
            fieldsToUpdate = removeUndefinedProps({ title, content })
            forCollabNote = true
        }

        const updatedNote = await noteQuery.updateOneByID(
            id,
            getAuthUser(res)?._id,
            fieldsToUpdate,
            forCollabNote
        )

        return updatedNote
            ? createResponse(res, 200, 'Note updated.', {
                note: updatedNote
            }) : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.deleteOneOwn(id, getAuthUser(res)?._id)
        return note ? createResponse(res, 200, 'Note deleted.')
            : createResponse(res, 400, 'Couldn\'t delete note.')
    } catch (err) { return next(err) }
}

const duplicateNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const note = await noteQuery.getOneByID(id, getAuthUser(res)?._id)
        if (!note) return createResponse(res, 400, 'Couldn\'t duplicate note.')

        const newNote = await noteQuery.createNewNote({
            title: note.title,
            content: note.content,
            color: note.color,
            archived: note.archived,
            owner: getAuthUser(res)?._id
        })

        return newNote ? createResponse(res, 200, 'Note duplicated.', {
            note: newNote
        }) : createResponse(res, 400, 'Couldn\'t duplicate note.')
    } catch (err) { return next(err) }
}

export default { getOneNote, getAllNotes, addNote, editNote, deleteNote, duplicateNote }
