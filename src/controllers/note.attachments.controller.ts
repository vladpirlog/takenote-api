import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import uploadFile from '../utils/uploadFile.util'
import { UploadedFile } from 'express-fileupload'
import noteAttachmentsQuery from '../queries/note.attachments.query'
import getAuthenticatedUser from '../utils/getAuthenticatedUser.util'
import checkLimits from '../utils/checkLimits.util'
import deleteFile from '../utils/deleteFile.util'

const addAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body
        const { id } = req.params
        const file = req.files?.photo

        if (!file) {
            return createResponse(res, 400, 'File not found.')
        }

        if (!(await checkLimits.forAttachment(id, getAuthenticatedUser(res)?._id))) {
            deleteFile(file)
            return createResponse(res, 400, 'Attachments limit exceeded.')
        }

        const url = await uploadFile(
            file as UploadedFile,
            getAuthenticatedUser(res)?._id,
            id
        )

        const newNote = await noteAttachmentsQuery.addAttachment(
            id, getAuthenticatedUser(res)?._id, { url, title, description }
        )

        return newNote
            ? createResponse(res, 200, 'Attachment added.', {
                attachment: newNote.attachments[newNote.attachments.length - 1]
            }) : createResponse(res, 400, 'Couldn\'t add attachment.')
    } catch (err) { return next(err) }
}

const editAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.editAttachment(
            id,
            getAuthenticatedUser(res)?._id,
            attachmentID,
            { title, description }
        )

        return newNote
            ? createResponse(res, 200, 'Attachment edited.', {
                attachment: newNote.attachments.filter(a => a.id === attachmentID)[0]
            }) : createResponse(res, 400, 'Couldn\'t edit attachment.')
    } catch (err) { return next(err) }
}

const deleteAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.deleteAttachment(
            id,
            getAuthenticatedUser(res)?._id,
            attachmentID
        )
        return newNote
            ? createResponse(res, 200, 'Attachment deleted.')
            : createResponse(res, 400, 'Couldn\'t delete attachment.')
    } catch (err) { return next(err) }
}

export default { addAttachment, editAttachment, deleteAttachment }
