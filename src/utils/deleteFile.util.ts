import { UploadedFile } from 'express-fileupload'
import fs from 'fs'

/**
 * Deletes one or more files from the server. Returns true if operation was successful.
 * @param file a file or an array of files of type UploadedFile
 */
const deleteFile = (file: UploadedFile | UploadedFile[]) => {
    try {
        if (Array.isArray(file)) {
            file.forEach((f) => fs.unlinkSync(f.tempFilePath))
        } else { fs.unlinkSync(file.tempFilePath) }
        return true
    } catch (err) { return false }
}

export default deleteFile
