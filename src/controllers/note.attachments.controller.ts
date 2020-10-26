import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import uploadFile from '../utils/uploadFile.util'
import { UploadedFile } from 'express-fileupload'
import noteAttachmentsQuery from '../queries/note.attachments.query'
import getAuthUser from '../utils/getAuthUser.util'
import constants from '../config/constants.config'
import { AddAttachmentBody, EditAttachmentBody } from '../types/RequestBodies'

const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body as AddAttachmentBody
        const { id } = req.params
        const file = req.files?.photo

        if (!file) {
            return createResponse(res, 400, 'File not found.')
        }
        const url = await uploadFile(file as UploadedFile, getAuthUser(res).id, id, constants.nodeEnv)

        const newNote = await noteAttachmentsQuery.addAttachment(id, { url, title, description })
        if (!newNote) return createResponse(res, 400, 'Couldn\'t add attachment.')

        const insertedAttachment = newNote.attachments[newNote.attachments.length - 1]
        return createResponse(res, 200, 'Attachment added.', {
            attachment: {
                id: insertedAttachment.id,
                url: insertedAttachment.url,
                title: insertedAttachment.title,
                description: insertedAttachment.description
            }
        })
    } catch (err) { return next(err) }
}

const editAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body as EditAttachmentBody
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.editAttachment(
            id, attachmentID, { title, description }
        )

        const updatedAttachment = newNote?.attachments.find(a => a.id === attachmentID)
        if (!newNote || !updatedAttachment) return createResponse(res, 400, 'Couldn\'t edit attachment.')

        return createResponse(res, 200, 'Attachment edited.', {
            attachment: {
                id: updatedAttachment.id,
                url: updatedAttachment.url,
                title: updatedAttachment.title,
                description: updatedAttachment.description
            }
        })
    } catch (err) { return next(err) }
}

const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.deleteAttachment(id, attachmentID)
        return newNote
            ? createResponse(res, 200, 'Attachment deleted.')
            : createResponse(res, 400, 'Couldn\'t delete attachment.')
    } catch (err) { return next(err) }
}

export default { addAttachment, editAttachment, deleteAttachment }
