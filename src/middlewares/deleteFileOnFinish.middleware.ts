import { NextFunction, Request, Response } from 'express'
import fs from 'fs'

/**
 * Middleware for deleting the photo(s) uploaded on the server after processing.
 */
const deleteFileOnFinish = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        try {
            const file = req.files?.photo
            if (file) {
                if (Array.isArray(file)) {
                    file.forEach(f => fs.unlink(f.tempFilePath, () => {}))
                } else { fs.unlink(file.tempFilePath, () => {}) }
            }
        } catch (err) { return next(err) }
    })
    return next()
}

export default deleteFileOnFinish
