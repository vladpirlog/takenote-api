import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import { INoteSchema } from '../types/Note'
import { AttachmentType } from '../enums/AttachmentType.enum'
const cloudinary = require('cloudinary').v2
const { Storage } = require('@google-cloud/storage')

const uploadToGoogleCloudStorage = async (
    filePath: string,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id']
) => {
    const storage = new Storage()
    const options = {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000'
        },
        destination: `${userID}/${noteID}/${new Date().getTime().toString()}-${filePath}`
    }

    const [result] = await storage.bucket(constants.storage.google.bucketName).upload(filePath, options)
    const [metadata] = await result.getMetadata()

    return encodeURI(`${constants.domain.staticURL}/${metadata.name}`)
}

const uploadToCloudinary = async (
    filePath: string,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id'],
    fileType: AttachmentType
) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: `${userID}/${noteID}`,
        resource_type: fileType === AttachmentType.IMAGE ? 'image' : 'video'
    })
    return result.secure_url as string
}

/**
 * Async function that uploads a file to one of the storage providers and returns the file's URL.
 * @param filePath the path to the file to be uploaded
 * @param userID id of the file's owner
 * @param noteID id of the note where the attachment is created
 * @param fileType the type of file to upload
 * @param env the current environment of the app, based on which the storage service is chosen
 */
const uploadFile = (
    filePath: string,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id'],
    fileType: AttachmentType,
    env: string
) => {
    if (env === 'production') {
        return uploadToGoogleCloudStorage(filePath, userID, noteID)
    }
    return uploadToCloudinary(filePath, userID, noteID, fileType)
}

export default uploadFile
