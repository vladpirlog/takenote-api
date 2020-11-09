import { Role } from '../enums/Role.enum'
import Note from '../models/Note'
import Notepad from '../models/Notepad'
import { INoteSchema } from '../types/Note'
import { IUserSchema } from '../types/User'

const note = (userID: IUserSchema['id']) => {
    return Note.find({
        [`users.${userID}.roles`]: Role.OWNER
    }).countDocuments().exec()
}

const notepad = (userID: IUserSchema['id']) => {
    return Notepad.find({
        [`users.${userID}.roles`]: Role.OWNER
    }).countDocuments().exec()
}

const tag = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id']
) => {
    const note = await Note.findOne({ id: noteID, [`users.${userID}.subject.id`]: userID }).exec()
    return note?.users.get(userID)?.tags.length || 0
}

const attachment = async (noteID: INoteSchema['id']) => {
    const note = await Note.findOne({ id: noteID })
    return note?.attachments.length || 0
}

const collaborator = async (noteID: INoteSchema['id']) => {
    const note = await Note.findOne({ id: noteID })
    if (!note) return 0
    return Array.from(note.users.values()).filter(val => !val.roles.includes(Role.OWNER)).length || 0
}

export default { note, tag, attachment, collaborator, notepad }
