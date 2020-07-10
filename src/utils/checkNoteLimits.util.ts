import { INoteSchema } from '../models/Note'
import constants from '../config/constants.config'
import noteCrudQuery from '../queries/note.crud.query'
import { IUserSchema } from '../models/User'

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
        ? note.tags.length + tags.length <= constants.limitsPerNote.tag
        : false
}

/**
 * Returns true if the number of attachments does not exceed the limit per note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const forAttachment = async (noteID: INoteSchema['_id'], userID: IUserSchema['_id']) => {
    const note = await noteCrudQuery.getOneOwnByID(noteID, userID)
    return note
        ? note.attachments.length + 1 <= constants.limitsPerNote.attachment
        : false
}

/**
 * Returns true if the number of collaborators does not exceed the limit per note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 */
const forPermission = async (noteID: INoteSchema['_id'], userID: IUserSchema['_id']) => {
    const note = await noteCrudQuery.getOneOwnByID(noteID, userID)
    return note
        ? note.permissions.length + 1 <= constants.limitsPerNote.permission
        : false
}

export default { forTag, forAttachment, forPermission }
