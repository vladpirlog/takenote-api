import Note from '../models/Note'
import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import { INoteSchema } from '../types/Note'
import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'
import { INotepadSchema } from '../types/Notepad'
import Notepad from '../models/Notepad'

type AddOrUpdateNoteProps = Partial<Pick<INoteSchema, 'title' | 'content'> & {
    archived: boolean
    color: Color
    fixed: boolean
}>

type CreateNoteArg = AddOrUpdateNoteProps & {
    owner: Pick<IUserSchema, 'id' | 'username' | 'email'>
}

/**
 * Fetches all the notes that belong to a user.
 * @param userID id of the user
 * @param skip number of notes to skip; defaults to 0
 * @param limit maximum number of notes to return; defaults to the note limit per user
 * @param collaborations whether to fetch only the user's own notes; defaults to true
 * @param archived if defined, only notes with the matching archived field are returned, else all the notes
 */
const getAll = (
    userID: IUserSchema['id'],
    skip: number = 0,
    limit: number = constants.limits.perUser.notes,
    collaborations: boolean = true,
    archived?: boolean
) => {
    const query: any = { [`users.${userID}.subject.id`]: userID }
    if (!collaborations) query[`users.${userID}.roles`] = Role.OWNER
    if (archived !== undefined) query[`users.${userID}.archived`] = archived

    return Note.find(query).skip(skip).limit(limit).exec()
}

/**
 * Fetches a note by the id property (the note mustn't be part of a notepad).
 * @param noteID id of the note
 */
const getOneByID = (noteID: INoteSchema['id']) => {
    return Note.findOne({ id: noteID }).exec()
}

/**
 * Fetches all the notes that are part of a notepad.
 * @param notepadID the id of the notepad
 */
const getAllByNotepad = (notepadID: INotepadSchema['id']) => {
    return Note.find({ notepadID }).exec()
}

/**
 * Creates a new note with the specified properties.
 * @param props object containing the note properties and the owner
 */
const createOne = (props: CreateNoteArg) => {
    const newNote = new Note({
        title: props.title || '',
        content: props.content || '',
        [`users.${props.owner.id}`]: {
            archived: props.archived || false,
            color: props.color || Color.DEFAULT,
            fixed: props.fixed || false,
            subject: props.owner,
            tags: [],
            roles: [Role.OWNER]
        }
    })
    return newNote.save()
}

const createOneInNotepad = async (
    userID: IUserSchema['id'],
    notepadID: INotepadSchema['id'],
    props: AddOrUpdateNoteProps
) => {
    const notepad = await Notepad.findOne({ id: notepadID }).exec()
    if (!notepad) return null

    const users: INoteSchema['users'] = new Map()

    Array.from(notepad.users.entries()).forEach(([key, value]) => {
        users.set(key, {
            subject: value.subject,
            roles: value.roles,
            archived: false,
            color: Color.DEFAULT,
            tags: [],
            fixed: false
        })
    })
    const userProps = users.get(userID)
    if (!userProps) throw new Error()
    users.set(userID, {
        subject: userProps.subject,
        roles: userProps.roles,
        archived: props.archived || false,
        color: props.color || Color.DEFAULT,
        tags: [],
        fixed: props.fixed || false
    })
    const newNote = new Note({
        title: props.title || '',
        content: props.content || '',
        notepadID,
        users
    })

    return newNote.save()
}

/**
 * Delete a note.
 * @param noteID id of the note
 */
const deleteOneByID = (noteID: INoteSchema['id']) => {
    return Note.findOneAndDelete({ id: noteID }).exec()
}

/**
 * Updates a note. Updated properties depend on the user's role.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param props object containing the new note properties
 */
const updateOneByID = (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    props: AddOrUpdateNoteProps
) => {
    return Note.findOneAndUpdate(
        { id: noteID, [`users.${userID}.subject.id`]: userID },
        removeUndefinedProps({
            [`users.${userID}.archived`]: props.archived,
            [`users.${userID}.color`]: props.color,
            [`users.${userID}.fixed`]: props.fixed,
            title: props.title,
            content: props.content
        }),
        { new: true }
    ).exec()
}

/**
 * The user loses ownership of a note when moving it to a not-owned notepad.
*/
const moveOne = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    destinationNotepadID: INotepadSchema['id'] = ''
): Promise<INoteSchema | null> => {
    const users: INoteSchema['users'] = new Map()
    if (destinationNotepadID) {
        const notepad = await Notepad.findOne({ id: destinationNotepadID }).exec()
        if (!notepad) return null

        Array.from(notepad.users.entries()).forEach(([key, value]) => {
            users.set(key, {
                ...value,
                archived: false,
                color: Color.DEFAULT,
                tags: [],
                fixed: false
            })
        })
    } else {
        const note = await Note.findOne({ id: noteID, notepadID: { $ne: '' } }).exec()
        const userData = note?.users.get(userID)
        if (!userData) return null
        users.set(userID, userData)
    }

    return Note.findOneAndUpdate(
        { id: noteID, notepadID: { $ne: destinationNotepadID } },
        { notepadID: destinationNotepadID, users, share: { active: false } },
        { new: true }
    ).exec()
}

export default {
    getAll,
    getOneByID,
    getAllByNotepad,
    createOne,
    deleteOneByID,
    updateOneByID,
    createOneInNotepad,
    moveOne
}
