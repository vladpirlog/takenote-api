import Note from '../models/Note'
import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import { INoteSchema } from '../types/Note'
import Color from '../enums/Color.enum'
import { NoteRole } from '../utils/accessManagement.util'

/**
 * Fetches all the notes belonging to the user.
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
    const query: any = { 'subject.id': userID }
    if (!collaborations) query.roles = NoteRole.OWNER
    if (archived !== undefined) query.archived = archived

    return Note.find({ users: { $elemMatch: query } }).skip(skip).limit(limit).exec()
}

/**
 * Fetches a note by the id property.
 * @param noteID id of the note
 * @param userID id of the note's owner or collaborator
 */
const getOneByID = (noteID: INoteSchema['id']) => {
    return Note.findOne({ id: noteID }).exec()
}

/**
 * Fetches a note by the share code.
 * The note does not include the permissions array.
 * @param code share code of the note
 */
const getOneByShareCode = (code: INoteSchema['share']['code']) => {
    return Note.findOne({ 'share.code': code }).exec()
}

type CreateNoteArg = Partial<
    Pick<INoteSchema, 'title' | 'content'> &
    Pick<INoteSchema['users'][0], 'archived' | 'color' | 'fixed' | 'tags'>>
& { owner: Pick<IUserSchema, 'id' | 'username' | 'email'> }

/**
 * Creates a new note with the specified properties.
 * @param props object containing the note properties and the owner
 */
const createOne = (props: CreateNoteArg) => {
    const newNote = new Note({
        title: props.title || '',
        content: props.content || '',
        users: [
            {
                archived: props.archived || false,
                color: props.color || Color.DEFAULT,
                fixed: props.fixed || false,
                subject: props.owner,
                tags: [],
                roles: [NoteRole.OWNER]
            }
        ]
    })
    return newNote.save()
}

/**
 * Delete a note.
 * @param noteID id of the note
 * @param userID id of the note's owner or collaborator
 */
const deleteOneByID = (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id']
) => {
    return Note.findOneAndDelete({ id: noteID, 'users.subject.id': userID }).exec()
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
    props: Partial<Pick<INoteSchema, 'title' | 'content'>
        & Pick<INoteSchema['users'][0], 'archived' | 'color' | 'fixed'>>
) => {
    return Note.findOneAndUpdate(
        { id: noteID, 'users.subject.id': userID },
        removeUndefinedProps({
            'users.$.archived': props.archived,
            'users.$.color': props.color,
            'users.$.fixed': props.fixed,
            title: props.title,
            content: props.content
        }),
        { new: true }
    ).exec()
}

export default {
    getAll,
    getOneByID,
    getOneByShareCode,
    createOne,
    deleteOneByID,
    updateOneByID
}
