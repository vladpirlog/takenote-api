import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'
import Attachment from '../models/Attachment'

/**
 * Adds an attachment(title, description, url) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param attachment object of type attachment
 */
const addAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachment: {
        title: INoteSchema['attachments'][0]['title'],
        url: INoteSchema['attachments'][0]['url'],
        description: INoteSchema['attachments'][0]['description']
    }
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $push: { attachments: new Attachment({ ...attachment }) } },
        { new: true }
    ).exec()
}

/**
 * Updated an attachment of a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param newAttachment object of type attachment with the url as identifier
 */
const editAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachment: {
        _id: INoteSchema['attachments'][0]['_id'],
        title: INoteSchema['attachments'][0]['title'],
        description: INoteSchema['attachments'][0]['description']
    }
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        {
            'attachments.$[element].title': attachment.title,
            'attachments.$[element].description': attachment.description
        },
        { new: true, arrayFilters: [{ 'element._id': attachment._id }] }
    ).exec()
}

/**
 * Remove an attachment from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param attachmentURL the url of the attachment to be removed
 */
const deleteAttachment = async (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachmentID: INoteSchema['attachments'][0]['_id']
) => {
    return await Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $pull: { attachments: { _id: attachmentID } } },
        { new: true }
    ).exec()
}

export default {
    addAttachment,
    editAttachment,
    deleteAttachment
}
