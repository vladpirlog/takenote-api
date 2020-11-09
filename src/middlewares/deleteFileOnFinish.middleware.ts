import { NextFunction, Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import { promises as fs } from 'fs'

/**
 * Middleware for deleting the photo(s) uploaded on the server after processing.
 */
const deleteFileOnFinish = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        const file = req.files?.photo
        if (file) {
            if (Array.isArray(file)) {
                const promiseArr = file.map((f: UploadedFile) => fs.unlink(f.tempFilePath))
                Promise
                    .all(promiseArr)
                    .catch(() => console.log('Could not delete files.'))
            } else {
                fs.unlink(file.tempFilePath).catch(() => console.log('Could not delete file.'))
            }
        }
    })
    return next()
}

export default deleteFileOnFinish
