import { INoteSchema } from '../models/Note'
import constants from '../config/constants.config'
import { IUserSchema } from '../models/User'
import limitsQuery from '../queries/limits.query'

/**
 * Returns true if the number of notes does not exceed the limit per user.
 * @param userID id of the note's owner
 */
const forNote = async (
    userID: IUserSchema['_id']
): Promise<boolean> => {
    const length = await limitsQuery.note(userID)
    return length + 1 <= constants.limits.perUser.notes
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
    const length = await limitsQuery.tag(noteID, userID)
    return length ? length + tags.length <= constants.limits.perNote.tags : false
}

/**
 * Higher order function. Checks if the number of attachments/permissions does not exceed the limit per note.
 * @param type a string representing the type of objects to be checked
 */
const forPermissionOrAttachment = (type: 'attachments' | 'permissions') => {
    return async (noteID: INoteSchema['_id'], userID: IUserSchema['_id']) => {
        const length = await limitsQuery.permissionOrAttachment(type)(noteID, userID)
        return length ? length + 1 <= constants.limits.perNote[type] : false
    }
}

export default {
    forNote,
    forTag,
    forAttachment: forPermissionOrAttachment('attachments'),
    forPermission: forPermissionOrAttachment('permissions')
}
