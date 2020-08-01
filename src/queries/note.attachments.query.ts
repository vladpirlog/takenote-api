import Note, { INoteSchema } from '../models/Note'
import { IUserSchema } from '../models/User'
import Attachment from '../models/Attachment'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'

/**
 * Adds an attachment(title, description, url) to a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param data object of type attachment
 */
const addAttachment = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    data: {
        url: INoteSchema['attachments'][0]['url'],
        title: INoteSchema['attachments'][0]['title'],
        description: INoteSchema['attachments'][0]['description'],
    }
) => {
    return Note.findOneAndUpdate(
        { _id: noteID, owner: userID },
        { $push: { attachments: new Attachment({ ...removeUndefinedProps(data) }) } },
        { new: true }
    ).exec()
}

/**
 * Updated an attachment of a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param newAttachment object of type Attachment
 */
const editAttachment = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachmentID: INoteSchema['attachments'][0]['_id'],
    data: {
        title: INoteSchema['attachments'][0]['title'],
        description: INoteSchema['attachments'][0]['description']
    }
) => {
    return Note.findOneAndUpdate(
        { _id: noteID, owner: userID, 'attachments._id': attachmentID },
        removeUndefinedProps({
            'attachments.$.title': data.title,
            'attachments.$.description': data.description
        }),
        { new: true }
    ).exec()
}

/**
 * Remove an attachment from a note.
 * @param noteID id of the note
 * @param userID id of the note's owner
 * @param attachmentURL the url of the attachment to be removed
 */
const deleteAttachment = (
    noteID: INoteSchema['_id'],
    userID: IUserSchema['_id'],
    attachmentID: INoteSchema['attachments'][0]['_id']
) => {
    return Note.findOneAndUpdate(
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
