import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { deleteFileFromCloudStorage, uploadFileToCloudStorage } from '../utils/cloudFileStorage.util'
import noteAttachmentsQuery from '../queries/note.attachments.query'
import constants from '../config/constants.config'
import { AddAttachmentBody, EditAttachmentBody } from '../types/RequestBodies'
import { AttachmentType } from '../enums/AttachmentType.enum'
import convertAudioToWav from '../utils/convertAudioToWav.util'
import { promises as fs } from 'fs'
import createID from '../utils/createID.util'

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
            const attachmentID = createID('attachment')
            const url = await uploadFileToCloudStorage(
                pathOfFileToUpload, `${id}/${attachmentID}`, attachmentType, constants.nodeEnv
            )
            const insertedAttachment = await noteAttachmentsQuery.addAttachment(
                id,
                { id: attachmentID, url, title, description, type: attachmentType }
            )
            if (!insertedAttachment) return createResponse(res, 400, 'Couldn\'t add attachment.')

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

        const updatedAttachment = await noteAttachmentsQuery.editAttachment(
            id, attachmentID, { title, description }
        )

        if (!updatedAttachment) return createResponse(res, 400, 'Couldn\'t edit attachment.')

        return createResponse(res, 200, 'Attachment edited.', {
            attachment: updatedAttachment.getPublicInfo()
        })
    } catch (err) { return next(err) }
}

const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, attachmentID } = req.params

        const deletedAttachment = await noteAttachmentsQuery.deleteAttachment(id, attachmentID)
        if (!deletedAttachment) return createResponse(res, 400, 'Couldn\'t delete attachment.')
        res.on('finish', () => {
            deleteFileFromCloudStorage(
                `${id}/${attachmentID}`,
                deletedAttachment.type,
                constants.nodeEnv
            ).catch(() => console.warn(`Could not delete file ${id}/${attachmentID} from the cloud.`))
        })
        return createResponse(res, 200, 'Attachment deleted.')
    } catch (err) { return next(err) }
}

export default { addAttachment, editAttachment, deleteAttachment }
