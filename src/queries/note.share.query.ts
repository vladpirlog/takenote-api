import { Color } from '../interfaces/color.enum'
import Note, { INoteSchema, NoteRole } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Adds a collaborator to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param collaboratorIdentifier username or email of the collaborator user
 * @param role the role to be assigned to that user (EDITOR or VIEWER)
 */
const addCollaborator = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    collaborator: Pick<IUserSchema, 'id' | 'username' | 'email'>,
    role: NoteRole.EDITOR | NoteRole.VIEWER
) => {
    await Note.findOneAndUpdate(
        { id: noteID },
        {
            $pull: {
                users: {
                    // @ts-ignore
                    'subject.id': collaborator.id
                }
            }
        }
    )

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
 * @param userID id of the note's owner
 * @param collabUserID id of the collaborator to be removed
 */
const deleteCollaborator = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
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
 * @param userID id of the note's owner
 * @param newShare the new share object to be set (has active and code properties)
 */
const updateSharing = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
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
