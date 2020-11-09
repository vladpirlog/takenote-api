import { Role } from '../enums/Role.enum'
import Note from '../models/Note'
import Notepad from '../models/Notepad'
import { INoteSchema } from '../types/Note'
import { INotepadSchema, NotepadAndNotes } from '../types/Notepad'
import { IUserSchema } from '../types/User'
import mongoose from 'mongoose'
import Color from '../enums/Color.enum'

const addCollaborator = async (
    notepadID: INotepadSchema['id'],
    collaborator: Pick<IUserSchema, 'id' | 'username' | 'email'>,
    roles: Role[]
) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    const notepad = await Notepad.findOneAndUpdate(
        { id: notepadID },
        {
            $set: {
                [`users.${collaborator.id}`]: {
                    subject: collaborator,
                    roles
                }
            }
        },
        { new: true, session }
    ).exec()

    await Note.updateMany(
        { notepadID },
        {
            [`users.${collaborator.id}`]: {
                subject: collaborator,
                roles,
                tags: [],
                archived: false,
                fixed: false,
                color: Color.DEFAULT
            }
        },
        { session }
    )

    await session.commitTransaction()
    session.endSession()
    return notepad
}

const deleteCollaborator = async (
    notepadID: INotepadSchema['id'],
    collaboratorID: IUserSchema['id']
) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    const notepad = await Notepad.findOneAndUpdate(
        {
            id: notepadID,
            [`users.${collaboratorID}.roles`]: { $nin: [Role.OWNER] }
        },
        {
            $unset: {
                [`users.${collaboratorID}`]: ''
            }
        },
        { new: true, session }
    ).exec()

    await Note.updateMany(
        {
            notepadID,
            [`users.${collaboratorID}.roles`]: { $nin: [Role.OWNER] }
        },
        {
            $unset: {
                [`users.${collaboratorID}`]: ''
            }
        },
        { session }
    )

    await session.commitTransaction()
    session.endSession()
    return notepad
}

const updateSharing = (
    notepadID: INotepadSchema['id'],
    newShare: INotepadSchema['share']
) => {
    return Notepad.findOneAndUpdate(
        { id: notepadID },
        { share: newShare },
        { new: true }
    ).exec()
}

/**
 * Fetches a notepad and the notes inside by the share code.
 * @param code share code of the notepad
 */
const getOneByShareCode = async (
    code: INotepadSchema['share']['code']
): Promise<NotepadAndNotes | null> => {
    const aggregationPipeline = [
        {
            $match: { 'share.code': code }
        },
        {
            $lookup: {
                from: Note.collection.name,
                localField: 'id',
                foreignField: 'notepadID',
                as: 'notes'
            }
        }
    ]
    const [notepadAndNotes] = await Notepad.aggregate<INotepadSchema & {notes: INoteSchema[]}>(aggregationPipeline)
    if (!notepadAndNotes) return null
    const { notes, ...notepad } = notepadAndNotes
    return {
        notepad: new Notepad(notepad),
        notes: notes.map(n => new Note(n))
    }
}

export default { addCollaborator, deleteCollaborator, updateSharing, getOneByShareCode }
