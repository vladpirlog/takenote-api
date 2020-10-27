import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { UploadedFile } from 'express-fileupload'

/**
 * Middleware function that checks if the attachment photo exists in the request and if it meets the size and mimetype requirements
 */
const attachmentMetadata = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || !req.files.photo) {
            return createResponse(res, 422, 'Invalid file.')
        }
        const file: UploadedFile | UploadedFile[] = req.files.photo
        if (Array.isArray(file)) {
            return createResponse(res, 422, 'Multiple files uploaded.')
        }
        if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
            return createResponse(res, 415, 'File is not jpeg or png.')
        }

        if (file.size > 8000000) {
            return createResponse(res, 413, 'File is larger than 8 MB.')
        }
        return next()
    } catch (err) { return next(err) }
}

export default attachmentMetadata
