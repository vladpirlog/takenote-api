import Note, { INoteSchema, NoteRole } from '../models/Note'
import { IUserSchema } from '../models/User'

/**
 * Returns the role (VIEWER, EDITOR or OWNER) that one of the users has for a note.
 * Returns null if the user is not a collaborator for that note.
 * @param noteID id of the note
 * @param userID id of the user
 */
const getNoteRole = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id']
): Promise<NoteRole | null> => {
    const note = await Note.findOne({ id: noteID }).exec()
    return note?.users.find(u => u.subject.id === userID)?.role || null
}

export default getNoteRole
