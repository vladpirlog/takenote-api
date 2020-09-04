import Note, { INoteSchema, INoteBody } from '../models/Note'
import { IUserSchema } from '../models/User'
import { PermissionLevel } from '../models/Permission'

/**
 * Fetches all the notes belonging to the user.
 * @param userID id of the user
 * @param archived if not null, only notes with the matching archived field are returned, else all the notes
 * @param collaborations if true, fetch user's own and collaborating notes, else only user's own
 * @param skip number of notes to skip
 * @param limit maximum number of notes to return
 */
const getAll = (userID: IUserSchema['_id'], options: {
        archived: boolean | null,
        collaborations: boolean,
        skip?: number,
        limit?: number
    }
) => {
    let completeFilter: any
    const ownNotesFilter: any = { owner: userID }
    const collabNotesFilter = { 'permissions.subject._id': userID }
    if (options.archived !== null) ownNotesFilter.archived = options.archived

    if (options.collaborations) {
        completeFilter = { $or: [ownNotesFilter, collabNotesFilter] }
    } else completeFilter = ownNotesFilter

    let query = Note.find(completeFilter)
    if (options.skip) query = query.skip(options.skip)
    if (options.limit) query = query.limit(options.limit)
    return query.exec()
}

/**
 * Fetches a note by the id property.
 * @param noteID id of the note
 * @param userID id of the note's owner or collaborator
 */
const getOneByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
) => {
    const note = await Note.findOne({
        _id: noteID,
        $or: [{ owner: userID }, { 'permissions.subject._id': userID }]
    }).exec()

    if (!note || note.owner === userID) return note

    note.permissions = note.permissions.filter(p => p.subject._id === userID)
    return note
}

/**
 * Fetches a note by the share code.
 * The note does not include the permissions array.
 * @param code share code of the note
 */
const getOneByShareCode = (
    code: INoteSchema['share']['code']
) => {
    return Note.findOne({ 'share.code': code })
        .select('-permissions').exec()
}

/**
 * Creates a new note with the specified properties.
 * @param props object containing the note properties and the owner
 */
const createOne = (props: {
  title?: INoteSchema['title'];
  content?: INoteSchema['content'];
  archived?: INoteSchema['archived'];
  color?: INoteSchema['color'];
  owner: INoteSchema['owner'];
}) => {
    const newNote = new Note(props)
    return newNote.save()
}

/**
 * Delete a note where the user is the owner. If user is only a collab, only the matching
 * permission is deleted.
 * @param noteID id of the note
 * @param userID id of the note's owner or collaborator
 */
const deleteOneByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
) => {
    const note = await Note.findOneAndDelete({
        _id: noteID,
        owner: userID
    }).exec()
    if (note) { return note }

    return Note.findOneAndUpdate(
        {
            _id: noteID,
            'permissions.subject._id': userID
        },
        {
            $pull: {
                permissions: {
                    // @ts-ignore (it throws a type error, but the query works)
                    'subject._id': userID
                }
            }
        },
        { new: true }
    ).exec()
}

/**
 * Updates a note where the user is the owner or a collaborator.
 * Updating a collaborating note does not return the full permissions array.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param props object containing the new note properties
 * @param allowForCollab allow collaborating notes to be updated
 */
const updateOneByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    props: INoteBody,
    allowForCollab: boolean
) => {
    if (allowForCollab) {
        const note = await Note.findOneAndUpdate(
            {
                _id: noteID,
                $or: [{ owner: userID }, {
                    permissions: {
                        $elemMatch: {
                            'subject._id': userID,
                            level: PermissionLevel.readWrite
                        }
                    }
                }]
            },
            props,
            { new: true }
        ).exec()

        if (!note || note.owner === userID) return note

        note.permissions = note.permissions.filter(p => p.subject._id === userID)
        return note
    }
    return Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        props,
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
