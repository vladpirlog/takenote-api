import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { UploadedFile } from 'express-fileupload'
import fs from 'fs'

/**
 * Middleware function that checks if the attachment photo exists in the request and if it meets the size and mimetype requirements
 */
export default function checkAttachmentInfo (
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.files || !req.files.photo) { return createResponse(res, 404, 'File not found.') }
        const file: UploadedFile | UploadedFile[] = req.files.photo
        if (Array.isArray(file)) {
            file.forEach((f) => fs.unlinkSync(f.tempFilePath))
            return createResponse(res, 400, 'Multiple files uploaded.')
        } else {
            if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
                fs.unlinkSync(file.tempFilePath)
                return createResponse(res, 415, 'File is not jpeg or png.')
            }

            if (file.size > 8000000) {
                fs.unlinkSync(file.tempFilePath)
                return createResponse(res, 413, 'File is larger than 8 MB.')
            }
        }
        return next()
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}
