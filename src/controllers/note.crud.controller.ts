import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import noteQuery from '../queries/note.crud.query'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import checkLimits from '../utils/checkLimits.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getOneNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const note = await noteQuery.getOneByID(id, getAuthenticatedUser(res)?.userID)
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
            getAuthenticatedUser(res)?.userID,
            archivedOption,
            skipOption,
            limitOption
        )
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
        if (!(await checkLimits.forNote(getAuthenticatedUser(res)?.userID))) {
            return createResponse(res, 400, 'Notes limit exceeded.')
        }
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

        const note = await noteQuery.getOneByID(id, getAuthenticatedUser(res)?.userID)
        if (note) {
            const newNote = await noteQuery.updateOneByID(
                id,
                getAuthenticatedUser(res)?.userID,
                removeUndefinedProps({ title, content, archived, color }),
                false
            )
            if (newNote) {
                return createResponse(res, 200, 'Note updated.', {
                    note: newNote
                })
            }
            return createResponse(res, 400, 'Couldn\'t update note.')
        }

        const newNote = await noteQuery.updateOneByID(
            id,
            getAuthenticatedUser(res)?.userID,
            removeUndefinedProps({ title, content }),
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

        const note = await noteQuery.getOneByID(id, getAuthenticatedUser(res)?.userID)
        if (!note) return createResponse(res, 400, 'Couldn\'t duplicate note.')

        const newNote = await noteQuery.createNewNote({
            title: note.title,
            content: note.content,
            color: note.color,
            archived: note.archived,
            owner: getAuthenticatedUser(res)?.userID
        })

        return newNote ? createResponse(res, 200, 'Note duplicated.', {
            note: newNote
        }) : createResponse(res, 400, 'Couldn\'t duplicate note.')
    } catch (err) { return next(err) }
}

export default { getOneNote, getAllNotes, addNote, editNote, deleteNote, duplicateNote }
