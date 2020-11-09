import Color from '../enums/Color.enum'
import { Role } from '../enums/Role.enum'
import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'

/**
 * All sharing-related operations are only allowed on notes which are not part of a notepad.
*/

/**
 * Fetches a note by the share code.
 * @param code share code of the note
 */
const getOneByShareCode = (code: INoteSchema['share']['code']) => {
    return Note.findOne({ 'share.code': code, notepadID: '' }).exec()
}

/**
 * Adds a collaborator to a note.
 * @param noteID id of the note
 * @param collaborator id, username and email of the collaborator
 * @param roles the role to be assigned to that user
 */
const addCollaborator = async (
    noteID: INoteSchema['id'],
    collaborator: Pick<IUserSchema, 'id' | 'username' | 'email'>,
    roles: Role[]
) => {
    return Note.findOneAndUpdate(
        { id: noteID, notepadID: '' },
        {
            $set: {
                [`users.${collaborator.id}`]: {
                    subject: collaborator,
                    roles,
                    tags: [],
                    archived: false,
                    color: Color.DEFAULT,
                    fixed: false
                }
            }
        },
        { new: true }
    ).exec()
}

/**
 * Remove a collaborator from a note. The query prevents from removing the owner of the note.
 * @param noteID id of the note
 * @param collaboratorID id of the collaborator to be removed
 */
const deleteCollaborator = (
    noteID: INoteSchema['id'],
    collaboratorID: IUserSchema['id']
) => {
    return Note.findOneAndUpdate(
        {
            id: noteID,
            notepadID: '',
            [`users.${collaboratorID}.roles`]: { $nin: [Role.OWNER] }
        },
        {
            $unset: {
                [`users.${collaboratorID}`]: ''
            }
        },
        { new: true }
    ).exec()
}

/**
 * Updates the sharing code and its state.
 * @param noteID id of the note
 * @param newShare the new share object to be set (has active and code properties)
 */
const updateSharing = (
    noteID: INoteSchema['id'],
    newShare: INoteSchema['share']
) => {
    return Note.findOneAndUpdate(
        { id: noteID, notepadID: '' },
        { share: newShare },
        { new: true }
    ).exec()
}

export default {
    addCollaborator,
    deleteCollaborator,
    updateSharing,
    getOneByShareCode
}
