import Color from '../enums/Color.enum'
import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'
import { NoteRole } from '../utils/accessManagement.util'

/**
 * Adds a collaborator to a note.
 * @param noteID id of the note
 * @param collaborator id, username and email of the collaborator
 * @param roles the role to be assigned to that user
 */
const addCollaborator = async (
    noteID: INoteSchema['id'],
    collaborator: Pick<IUserSchema, 'id' | 'username' | 'email'>,
    roles: NoteRole[]
) => {
    const note = await Note.findOne({ id: noteID, 'users.subject.id': collaborator.id }).exec()

    if (note) {
        return Note.findOneAndUpdate(
            { id: noteID, 'users.subject.id': collaborator.id },
            { $set: { 'users.$.roles': roles } },
            { new: true }
        ).exec()
    }

    return Note.findOneAndUpdate(
        { id: noteID },
        {
            $push: {
                users: {
                    subject: {
                        id: collaborator.id,
                        username: collaborator.username,
                        email: collaborator.email
                    },
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
            users: {
                $elemMatch: {
                    'subject.id': collaboratorID,
                    roles: { $nin: [NoteRole.OWNER] }
                }
            }
        },
        {
            $pull: {
                users: {
                    // @ts-ignore
                    'subject.id': collaboratorID
                }
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
        { id: noteID },
        { share: newShare },
        { new: true }
    ).exec()
}

export default {
    addCollaborator,
    deleteCollaborator,
    updateSharing
}
