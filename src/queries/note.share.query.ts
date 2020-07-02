import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'
import Permission from '../models/Permission'

/**
 * Adds a permission(subject and level) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param permission object of type permission
 */
const addPermission = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    permission: {
        subject: INoteSchema['permissions'][0]['subject'],
        level: INoteSchema['permissions'][0]['level']
    }
): Promise<INoteSchema | null> => {
    await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $pull: { permissions: { subject: permission.subject } }
        },
        { new: true }
    ).exec()
    const newNote = await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $push: { permissions: new Permission({ ...permission }) }
        },
        { new: true }
    ).exec()
    return newNote
}

/**
 * Removes a permission from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param collabUserID id of the collaborator to be removed
 */
const deletePermission = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    permissionID: INoteSchema['permissions'][0]['_id']
): Promise<INoteSchema | null> => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            $pull: { permissions: { _id: permissionID } }
        },
        { new: true }
    ).exec()
}

export default {
    addPermission,
    deletePermission
}
