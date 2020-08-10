import Note, { INoteSchema, INoteBody } from '../models/Note'
import { IUserSchema } from '../models/User'
import { PermissionLevel } from '../models/Permission'

/**
 * Fetches all the notes belonging to the user.
 * @param userID id of the user
 * @param skip number of notes to skip
 * @param limit maximum number of notes to return
 */
const getAllOwn = (
    userID: IUserSchema['_id'],
    skip?: number,
    limit?: number
) => {
    let query = Note.find({ owner: userID })
    if (skip) query = query.skip(skip)
    if (limit) query = query.limit(limit)
    return query.exec()
}

/**
 * Fetches all the notes where the user is a collaborator.
 * @param userID id of the user
 */
const getAllCollab = (
    userID: INoteSchema['permissions'][0]['subject']
) => {
    return Note.find({
        'permissions.subject': userID
    }).select('-permissions').exec()
}

/**
 * Fetches a note by the id property.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const getOneOwnByID = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
) => {
    return Note.findOne({ _id: noteID, owner: userID }).exec()
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
const createNewNote = (props: {
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
 * Removes one of the user's notes.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const deleteOneOwn = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
) => {
    return Note.findOneAndDelete({
        _id: noteID,
        owner: userID
    }).exec()
}

/**
 * Updates a note where the user is the owner or a collaborator.
 * Updating a collaborating note does not return the permissions array.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param props object containing the new note properties
 * @param allowForCollab allow collaborating notes to be updated
 */
const updateOneByID = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    props: INoteBody,
    allowForCollab: boolean
) => {
    if (allowForCollab) {
        return Note.findOneAndUpdate(
            {
                _id: noteID,
                $or: [{ owner: userID }, {
                    permissions: {
                        $elemMatch: {
                            subject: userID,
                            level: PermissionLevel.readWrite
                        }
                    }
                }]
            },
            props,
            { new: true }
        ).select('-permissions').exec()
    }
    return Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        props,
        { new: true }
    ).exec()
}

export default {
    getAllOwn,
    getAllCollab,
    getOneOwnByID,
    getOneByShareCode,
    createNewNote,
    deleteOneOwn,
    updateOneByID
}
