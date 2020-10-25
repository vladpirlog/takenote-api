import { Color } from '../interfaces/color.enum'
import Note, { INoteSchema, NoteRole } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Adds a collaborator to a note.
 * @param noteID id of the note
 * @param collaborator id, username and email of the collaborator
 * @param role the role to be assigned to that user (EDITOR or VIEWER)
 */
const addCollaborator = async (
    noteID: INoteSchema['id'],
    collaborator: Pick<IUserSchema, 'id' | 'username' | 'email'>,
    role: NoteRole.EDITOR | NoteRole.VIEWER
) => {
    const note = await Note.findOne({ id: noteID, 'users.subject.id': collaborator.id }).exec()

    if (note) {
        return Note.findOneAndUpdate(
            { id: noteID, 'users.subject.id': collaborator.id },
            { $set: { 'users.$.role': role } },
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
                    role,
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
 * Remove a collaborator from a note.
 * @param noteID id of the note
 * @param collaboratorID id of the collaborator to be removed
 */
const deleteCollaborator = (
    noteID: INoteSchema['id'],
    collaboratorID: IUserSchema['id']
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
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
