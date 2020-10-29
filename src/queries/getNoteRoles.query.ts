import Note from '../models/Note'
import { IUserSchema } from '../types/User'
import { INoteSchema } from '../types/Note'
import { NoteRole } from '../utils/accessManagement.util'

/**
 * Returns the roles array that one of the users has for a note.
 * @param noteID id of the note
 * @param userID id of the user
 */
const getNoteRoles = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id']
): Promise<NoteRole[]> => {
    const note = await Note.findOne({ id: noteID }).exec()
    return note?.users.find(u => u.subject.id === userID)?.roles || []
}

export default getNoteRoles
