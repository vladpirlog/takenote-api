import { NextFunction, Request, Response } from 'express'
import constants from '../config/constants.config'
import noteCrudQuery from '../queries/note.crud.query'
import notepadCrudQuery from '../queries/notepad.crud.query'
import { NoteBody } from '../types/RequestBodies'
import { deleteFolderFromCloudStorage } from '../utils/cloudFileStorage.util'
import createResponse from '../utils/createResponse.util'
import stringToBoolean from '../utils/stringToBoolean.util'

const getOneNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const { id } = req.params
        const { include_notes: includeNotes } = req.query

        const includeNotesParam = stringToBoolean(includeNotes as string | undefined)
        const noteAndNotepads = await notepadCrudQuery.getOneByID(id, includeNotesParam)
        if (!noteAndNotepads) return next()
        const { notepad, notes } = noteAndNotepads

        const publicNotepad = notepad.getPublicInfo(req.session.userID)
        const publicNotes = notes.map(n => n.getPublicInfo(req.session.userID))

        return notepad
            ? createResponse(res, 200, 'Notepad fetched.', {
                notepad: { ...publicNotepad, notes: publicNotes }
            })
            : createResponse(res)
    } catch (err) { return next(err) }
}

const getAllNotepads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const { collaborations, skip, limit, include_notes: includeNotes } = req.query

        const skipParam = skip ? parseInt(skip as string) : undefined
        const limitParam = limit ? parseInt(limit as string) : undefined
        const collaborationsParam = stringToBoolean(collaborations as string | undefined)
        const includeNotesParam = stringToBoolean(includeNotes as string | undefined)

        const notepadsAndNotes = await notepadCrudQuery.getAll(
            req.session.userID,
            skipParam,
            limitParam,
            collaborationsParam,
            includeNotesParam
        )
        const publicNotepads = notepadsAndNotes.map(({ notepad, notes }) => {
            const publicNotepad = notepad.getPublicInfo(req.session.userID)
            const publicNotes = notes.map(n => n.getPublicInfo(req.session.userID))
            return { ...publicNotepad, notes: publicNotes }
        })

        return createResponse(res, 200, 'Notepads fetched.', {
            notepads: publicNotepads
        })
    } catch (err) { return next(err) }
}

const addNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID || !req.session.userEmail) throw new Error('User not logged in.')
        const { title } = req.body

        const notepad = await notepadCrudQuery.createOne({
            title,
            owner: { id: req.session.userID, email: req.session.userEmail }
        })

        return notepad
            ? createResponse(res, 201, 'Notepad created.', {
                notepad: notepad.getPublicInfo(req.session.userID)
            })
            : createResponse(res, 400, 'Couldn\'t create note.')
    } catch (err) { return next(err) }
}

const editNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
        const { id } = req.params
        const { title } = req.body

        const notepad = await notepadCrudQuery.updateOneByID(id, { title })

        return notepad
            ? createResponse(res, 200, 'Notepad updated.', {
                notepad: notepad.getPublicInfo(req.session.userID)
            })
            : createResponse(res, 400, 'Couldn\'t update note.')
    } catch (err) { return next(err) }
}

const deleteNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const notepad = await notepadCrudQuery.deleteOneByID(id)
        if (!notepad) return createResponse(res, 400, 'Couldn\'t delete notepad.')

        res.on('finish', () => {
            noteCrudQuery.getAllByNotepad(id)
                .then(notes => notes.forEach(n => {
                    deleteFolderFromCloudStorage(n.id, constants.nodeEnv)
                        .catch(() => console.warn(`Could not delete folder ${n.id} from the cloud.`))
                }))
        })

        return createResponse(res, 200, 'Notepad deleted.')
    } catch (err) { return next(err) }
}

const addNoteInNotepad = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.userID) throw new Error('User not logged in.')
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

        const newNote = await noteCrudQuery.createOneInNotepad(req.session.userID, id, newNoteProps)
        return newNote
            ? createResponse(res, 201, 'Note created and added to notepad.', {
                note: newNote.getPublicInfo(req.session.userID)
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
