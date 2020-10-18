import { UploadedFile } from 'express-fileupload'
import { IUserSchema } from '../models/User'
import constants from '../config/constants.config'
import { INoteSchema } from '../models/Note'
const cloudinary = require('cloudinary').v2
const { Storage } = require('@google-cloud/storage')

/**
 * Async uploads a file to the cloudinary.com platform, in the folder belonging to the owner, then deletes the temp file.
 * Returns the file URL.
 * @param file file to be uploaded
 * @param userID id of the file's owner
 * @param noteID id of the note where the attachment is created
 */
const uploadFile = async (
    file: UploadedFile,
    userID: IUserSchema['_id'],
    noteID: INoteSchema['_id']
): Promise<INoteSchema['attachments'][0]['url']> => {
    if (constants.nodeEnv === 'production') {
        const storage = new Storage()
        const options = {
            gzip: true,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            },
            destination: `${userID}/${noteID}/${new Date().getTime().toString()}-${file.name}`
        }

        const [result] = await storage.bucket(constants.storage.google.bucketName).upload(file.tempFilePath, options)
        const [metadata] = await result.getMetadata()

        return encodeURI(`${constants.domain.staticURL}/${metadata.name}`)
    } else {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: `${userID}/`
        })
        return result.secure_url
    }
}

export default uploadFile
