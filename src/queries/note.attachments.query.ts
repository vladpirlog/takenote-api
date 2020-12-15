import Note from '../models/Note'
import Attachment from '../models/Attachment'
import removeUndefinedProps from '../utils/removeUndefinedProps.util'
import { IAttachmentSchema } from '../types/Attachment'
import { INoteSchema } from '../types/Note'

/**
 * Adds an attachment (title, description, url, type) to a note.
 * @param noteID id of the note
 * @param data new attachment properties
 * @returns the newly added attachment or undefined
 */
const addAttachment = async (
    noteID: INoteSchema['id'],
    data: Pick<IAttachmentSchema, 'url' | 'type'> & Partial<Pick<IAttachmentSchema, 'id' | 'title' | 'description'>>
) => {
    const note = await Note.findOneAndUpdate(
        { id: noteID },
        { $push: { attachments: new Attachment(removeUndefinedProps(data)) } },
        { new: true }
    ).exec()
    return note?.attachments[note.attachments.length - 1]
}

/**
 * Updates a note's attachment.
 * @param noteID id of the note
 * @param attachmentID id of the attachment to be updated
 * @param data object with optional properties of title and description
 * @returns the updated attachment or undefined
 */
const editAttachment = async (
    noteID: INoteSchema['id'],
    attachmentID: IAttachmentSchema['id'],
    data: Partial<Pick<IAttachmentSchema, 'title' | 'description'>>
) => {
    const note = await Note.findOneAndUpdate(
        { id: noteID, 'attachments.id': attachmentID },
        {
            $set: removeUndefinedProps({
                'attachments.$.title': data.title,
                'attachments.$.description': data.description
            })
        },
        { new: true }
    ).exec()
    return note?.attachments.find(a => a.id === attachmentID)
}

/**
 * Removes an attachment from a note.
 * @param noteID id of the note
 * @param attachmentID the id of the attachment to be removed
 * @returns the deleted attachment or undefined
 */
const deleteAttachment = async (
    noteID: INoteSchema['id'],
    attachmentID: INoteSchema['attachments'][0]['id']
) => {
    const oldNote = await Note.findOneAndUpdate(
        { id: noteID },
        { $pull: { attachments: { id: attachmentID } } }
    ).exec()
    return oldNote?.attachments.find(a => a.id === attachmentID)
}

export default {
    addAttachment,
    editAttachment,
    deleteAttachment
}
