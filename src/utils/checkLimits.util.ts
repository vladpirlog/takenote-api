import { INoteSchema } from '../models/Note'
import constants from '../config/constants.config'
import noteCrudQuery from '../queries/note.crud.query'
import { IUserSchema } from '../models/User'

/**
 * Returns true if the number of notes does not exceed the limit per user.
 * @param userID id of the note's owner
 */
const forNote = async (
    userID: IUserSchema['_id']
): Promise<boolean> => {
    const notes = await noteCrudQuery.getAllOwn(userID)
    return notes
        ? notes.length + 1 <= constants.limits.perUser.notes
        : false
}

/**
 * Returns true if the number of tags does not exceed the limit per note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param tags the tags to be added to the note
 */
const forTag = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    tags: string[]
): Promise<boolean> => {
    const note = await noteCrudQuery.getOneOwnByID(noteID, userID)
    return note
        ? note.tags.length + tags.length <= constants.limits.perNote.tags
        : false
}

/**
 * Returns a function that checks if the number of attachments/permissions does not exceed the limit per note.
 * @param type a string representing the type of objects to be checked
 */
const forPermissionOrAttachment = (type: 'attachments' | 'permissions') => {
    return async (noteID: INoteSchema['_id'], userID: IUserSchema['_id']) => {
        const note = await noteCrudQuery.getOneOwnByID(noteID, userID)
        return note
            ? note[type].length + 1 <= constants.limits.perNote[type]
            : false
    }
}

export default {
    forNote,
    forTag,
    forAttachment: forPermissionOrAttachment('attachments'),
    forPermission: forPermissionOrAttachment('permissions')
}
