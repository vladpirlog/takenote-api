import { UploadedFile } from 'express-fileupload'
import { IUserSchema } from '../models/User'
import deleteFile from './deleteFile.util'
const cloudinary = require('cloudinary').v2

/**
 * Async uploads a file to the cloudinary.com platform, in the folder belonging to the owner, then deletes the temp file.
 * Returns the file URL.
 * @param file file to be uploaded
 * @param userID id of the file's owner
 */
const uploadFile = async (
    file: UploadedFile,
    userID: IUserSchema['_id']
): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: `${userID}/`
        })
        deleteFile(file)
        return result.secure_url
    } catch (err) {
        deleteFile(file)
        throw err
    }
}

export default uploadFile
