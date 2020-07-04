import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'
import uploadFile from '../utils/uploadFile.util'
import { UploadedFile } from 'express-fileupload'
import noteAttachmentsQuery from '../queries/note.attachments.query'

const addAttachment = async (
    req: Request,
    res: Response
) => {
    try {
        const { title, description } = req.body
        const { id } = req.params

        if (!req.files || !req.files.photo) { return createResponse(res, 400, 'File not found.') }
        const url = await uploadFile(
            req.files.photo as UploadedFile,
            res.locals.user.userID
        )

        const newNote = await noteAttachmentsQuery.addAttachment(
            id,
            res.locals.user.userID,
            { url, title, description }
        )

        return newNote
            ? createResponse(res, 200, 'Attachment added.', {
                attachment: newNote.attachments[newNote.attachments.length - 1]
            }) : createResponse(res, 400, 'Couldn\'t add attachment.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const editAttachment = async (
    req: Request,
    res: Response
) => {
    try {
        const { title, description } = req.body
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.editAttachment(
            id,
            res.locals.user.userID,
            { _id: attachmentID, title, description }
        )

        return newNote
            ? createResponse(res, 200, 'Attachment edited.', {
                attachment: newNote.attachments.filter(a => a.id === attachmentID)[0]
            }) : createResponse(res, 400, 'Couldn\'t edit attachment.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const deleteAttachment = async (
    req: Request,
    res: Response
) => {
    try {
        const { id, attachmentID } = req.params

        const newNote = await noteAttachmentsQuery.deleteAttachment(
            id,
            res.locals.user.userID,
            attachmentID
        )
        return newNote
            ? createResponse(res, 200, 'Attachment deleted.')
            : createResponse(res, 400, 'Couldn\'t delete attachment.')
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default { addAttachment, editAttachment, deleteAttachment }
