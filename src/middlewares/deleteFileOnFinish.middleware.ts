import { NextFunction, Request, Response } from 'express'
import { promises as fs } from 'fs'

/**
 * Middleware for deleting the file uploaded on the server after processing.
 */
const deleteFileOnFinish = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        const file = req.file
        if (file) {
            fs.unlink(file.path).catch(() => console.warn(`Could not delete file ${file.path} from the server.`))
        }
    })
    return next()
}

export default deleteFileOnFinish
