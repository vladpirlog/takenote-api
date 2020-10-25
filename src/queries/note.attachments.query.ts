import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'
import Attachment, { IAttachmentSchema } from '../models/Attachment'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'

/**
 * Adds an attachment (title, description, url) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner or editor
 * @param data object of mandatory url field and optional title and description fields
 */
const addAttachment = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    data: Pick<IAttachmentSchema, 'url'> & Partial<Pick<IAttachmentSchema, 'title' | 'description'>>
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { $push: { attachments: new Attachment(removeUndefinedProps(data)) } },
        { new: true }
    ).exec()
}

/**
 * Updates a note's attachment.
 * @param noteID id of the note
 * @param userID id of the note's owner or editor
 * @param attachmentID id of the attachment to be updated
 * @param data object with optional properties of title and description
 */
const editAttachment = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    attachmentID: IAttachmentSchema['id'],
    data: Partial<Pick<IAttachmentSchema, 'title' | 'description'>>
) => {
    return Note.findOneAndUpdate(
        { id: noteID, 'attachments.id': attachmentID },
        {
            $set: removeUndefinedProps({
                'attachments.$.title': data.title,
                'attachments.$.description': data.description
            })
        },
        { new: true }
    ).exec()
}

/**
 * Removes an attachment from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner or editor
 * @param attachmentID the id of the attachment to be removed
 */
const deleteAttachment = async (
    noteID: INoteSchema['id'],
    userID: IUserSchema['id'],
    attachmentID: INoteSchema['attachments'][0]['id']
) => {
    return Note.findOneAndUpdate(
        { id: noteID },
        { $pull: { attachments: { id: attachmentID } } },
        { new: true }
    ).exec()
}

export default {
    addAttachment,
    editAttachment,
    deleteAttachment
}
