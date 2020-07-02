import Note, { INoteSchema, INoteBody } from '../models/Note'
import { IUserSchema } from '../models/User'
import { PermissionLevel } from '../models/Permission'

/**
 * Fetches all the notes belonging to the user.
 * @param userID id of the user
 */
const getAllOwn = async (
    userID: IUserSchema['_id']
): Promise<INoteSchema[]> => {
    return await Note.find({ owner: userID }).exec()
}

/**
 * Fetches all the notes where the user is a collaborator.
 * @param userID id of the user
 */
const getAllCollab = async (
    userID: INoteSchema['permissions'][0]['subject']
): Promise<INoteSchema[]> => {
    return await Note.find({
        'permissions.subject': userID
    })
        .select('-permissions')
        .exec()
}

/**
 * Fetches a note by the id property.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const getOneOwnByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
): Promise<INoteSchema | null> => {
    const notes = await Note.findOne({ _id: noteID, owner: userID }).exec()
    return notes
}

/**
 * Fetches a note by the share code.
 * The note does not include the permissions array.
 * @param code share code of the note
 */
const getOneByShareCode = async (
    code: INoteSchema['share']['code']
): Promise<INoteSchema | null> => {
    const note = await Note.findOne({ 'share.code': code })
        .select('-permissions')
        .exec()
    return note
}

/**
 * Creates a new note with the specified properties.
 * @param props object containing the note properties and the owner
 */
const createNewNote = async (props: {
  title?: INoteSchema['title'];
  content?: INoteSchema['content'];
  archived?: INoteSchema['archived'];
  color?: INoteSchema['color'];
  owner: INoteSchema['owner'];
}): Promise<INoteSchema | null> => {
    const newNote = new Note(props)
    return await newNote.save()
}

/**
 * Removes one of the user's notes.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const deleteOneOwn = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id']
): Promise<INoteSchema | null> => {
    const notes = await Note.findOneAndDelete({
        _id: noteID,
        owner: userID
    }).exec()
    return notes
}

/**
 * Updates a note where the user is the owner or a collaborator.
 * Updating a collaborating note does not return the permissions array.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param props object containing the new note properties
 * @param allowForCollab allow collaborating notes to be updated
 */
const updateOneOwnOrCollabByID = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    props: INoteBody,
    allowForCollab: boolean
): Promise<INoteSchema | null> => {
    if (allowForCollab) {
        const newNote = await Note.findOneAndUpdate(
            {
                _id: noteID,
                $or: [
                    { owner: userID },
                    {
                        permissions: {
                            $elemMatch: {
                                subject: userID,
                                level: PermissionLevel.readWrite
                            }
                        }
                    }
                ]
            },
            props,
            { new: true }
        )
            .select('-permissions')
            .exec()
        return newNote
    }
    const newNote = await Note.findOneAndUpdate(
        {
            _id: noteID,
            owner: userID
        },
        props,
        { new: true }
    ).exec()
    return newNote
}

export default {
    getAllOwn,
    getAllCollab,
    getOneOwnByID,
    getOneByShareCode,
    createNewNote,
    deleteOneOwn,
    updateOneOwnOrCollabByID
}
