import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import uploadFile from '../utils/uploadFile.util'
import noteAttachmentsQuery from '../queries/note.attachments.query'
import getAuthUser from '../utils/getAuthUser.util'
import constants from '../config/constants.config'
import { AddAttachmentBody, EditAttachmentBody } from '../types/RequestBodies'
import { AttachmentType } from '../enums/AttachmentType.enum'
import convertAudioToWav from '../utils/convertAudioToWav.util'
import { promises as fs } from 'fs'

const addAttachment = (attachmentType: AttachmentType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, description } = req.body as AddAttachmentBody
            const { id } = req.params
            const file = req.file
            if (!file) return createResponse(res, 400, 'File not sent.')
            let pathOfFileToUpload = file.path

            const fileNeedsConversion = attachmentType === AttachmentType.AUDIO &&
                file.mimetype !== 'audio/wav' &&
                file.mimetype !== 'audio/wave' &&
                file.mimetype !== 'audio/mpeg'
            if (fileNeedsConversion) {
                pathOfFileToUpload = await convertAudioToWav(file.path)
                res.on('finish', () => fs.unlink(pathOfFileToUpload)
                    .catch(() => console.log('Could not delete file.')))
            }
            const url = await uploadFile(
                pathOfFileToUpload, getAuthUser(res).id, id, attachmentType, constants.nodeEnv
            )
            const newNote = await noteAttachmentsQuery.addAttachment(
                id,
                { url, title, description, type: attachmentType }
            )
            if (!newNote) return createResponse(res, 400, 'Couldn\'t add attachment.')

            const insertedAttachment = newNote.attachments[newNote.attachments.length - 1]
            return createResponse(res, 201, 'Attachment added.', {
                attachment: insertedAttachment.getPublicInfo()
            })
        } catch (err) { return next(err) }
    }
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
            attachment: updatedAttachment.getPublicInfo()
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
