import Note from '../models/Note'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'
import { NoteRole } from '../utils/accessManagement.util'

const note = (userID: IUserSchema['id']) => {
    return Note.find({
        users: {
            $elemMatch: {
                'subject.id': userID,
                roles: NoteRole.OWNER
            }
        }
    }).countDocuments().exec()
}

const tag = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id']
) => {
    const note = await Note.findOne({ id: noteID, 'users.subject.id': userID }).exec()
    return note?.users.find(u => u.subject.id === userID)?.tags.length || 0
}

const attachment = (noteID: INoteSchema['id']) => {
    return Note.findOne({ id: noteID }).then(n => n?.attachments.length || 0)
}

const collaborator = (noteID: INoteSchema['id']) => {
    return Note.findOne({ id: noteID }).then(n => n?.users.filter(u => !u.roles.includes(NoteRole.OWNER)).length || 0)
}

export default { note, tag, attachment, collaborator }
