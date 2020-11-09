import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import Notepad from '../models/Notepad'
import { INotepadSchema, NotepadAndNotes } from '../types/Notepad'
import { INoteSchema } from '../types/Note'
import Note from '../models/Note'
import { Role } from '../enums/Role.enum'
import mongoose from 'mongoose'

/**
 * Fetches all the notepads the user has access to, including the notes inside.
 * @param userID id of the user
 * @param skip number of notepads to skip; defaults to 0
 * @param limit maximum number of notepads to return; defaults to the notepad limit per user
 * @param collaborations whether to fetch only the user's own notepads; defaults to true
 * @param includeNotes if true, include the array of notes in the notepads; defaults to true
 */
const getAll = async (
    userID: IUserSchema['id'],
    skip: number = 0,
    limit: number = constants.limits.perUser.notepads,
    collaborations: boolean = true,
    includeNotes: boolean = true
): Promise<NotepadAndNotes[]> => {
    const matchQuery: any = { [`users.${userID}.subject.id`]: userID }
    if (!collaborations) matchQuery[`users.${userID}.roles`] = Role.OWNER
    const aggregationPipeline: any[] = [{ $match: matchQuery }]

    if (includeNotes) {
        aggregationPipeline.push({
            $lookup: {
                from: Note.collection.name,
                localField: 'id',
                foreignField: 'notepadID',
                as: 'notes'
            }
        })
        const notepadsWithNotes = await Notepad
            .aggregate<INotepadSchema & {notes: INoteSchema[]}>(aggregationPipeline)
            .skip(skip)
            .limit(limit)

        return notepadsWithNotes
            .map(({ notes, ...notepad }) => ({
                notepad: new Notepad(notepad),
                notes: notes.map(n => new Note(n))
            }))
    }
    const notepadsWithNotes = await Notepad
        .aggregate<INotepadSchema>(aggregationPipeline)
        .skip(skip)
        .limit(limit)

    return notepadsWithNotes
        .map(notepad => ({
            notepad: new Notepad(notepad),
            notes: []
        }))
}

/**
 * Fetches a notepad by the id property, as well as the notes inside.
 * @param notepadID id of the notepad
 * @param includeNotes if true, include the array of notes in the notepad; defaults to true
 * @returns an object with notepad and notes fields
 */
const getOneByID = async (
    notepadID: INotepadSchema['id'],
    includeNotes: boolean = true
): Promise<NotepadAndNotes | null> => {
    if (includeNotes) {
        const aggregationPipeline = [
            {
                $match: { id: notepadID }
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
        const [notepadAndNotes] = await Notepad
            .aggregate<INotepadSchema & {notes: INoteSchema[]}>(aggregationPipeline)
        if (!notepadAndNotes) return null
        const { notes, ...notepad } = notepadAndNotes
        return {
            notepad: new Notepad(notepad),
            notes: notes.map(n => new Note(n))
        }
    }
    const notepad = await Notepad.findOne({ id: notepadID })
    if (!notepad) return null
    return {
        notepad: new Notepad(notepad),
        notes: []
    }
}

type CreateNotepadArg = {
    title?: INotepadSchema['title']
    owner: Pick<IUserSchema, 'id' | 'username' | 'email'>
}

/**
 * Creates a new notepad with the specified properties.
 * @param props object containing the notepad title and the owner
 */
const createOne = (props: CreateNotepadArg) => {
    const newNotepad = new Notepad({
        title: props.title || '',
        [`users.${props.owner.id}`]: {
            subject: props.owner,
            roles: [Role.OWNER]
        }
    })
    return newNotepad.save()
}

/**
 * Delete a notepad.
 * @param notepadID id of the notepad
 */
const deleteOneByID = async (notepadID: INotepadSchema['id']) => {
    const session = await mongoose.startSession()
    session.startTransaction()

    const notepad = await Notepad.findOneAndDelete({ id: notepadID }, { session }).exec()
    await Note.deleteMany({ notepadID }, { session })

    await session.commitTransaction()
    session.endSession()
    return notepad
}

/**
 * Updates a notepad. Does not return the notes array.
 * @param notepadID id of the notepad
 * @param props object containing the new notepad properties
 */
const updateOneByID = (
    notepadID: INotepadSchema['id'],
    props: Partial<Pick<INotepadSchema, 'title'>>
) => {
    return Notepad.findOneAndUpdate(
        { id: notepadID },
        removeUndefinedProps({
            title: props.title
        }),
        { new: true }
    ).exec()
}

export default {
    getAll,
    getOneByID,
    createOne,
    deleteOneByID,
    updateOneByID
}
