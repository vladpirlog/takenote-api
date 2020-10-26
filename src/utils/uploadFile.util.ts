import { UploadedFile } from 'express-fileupload'
import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import { INoteSchema } from '../types/Note'
const cloudinary = require('cloudinary').v2
const { Storage } = require('@google-cloud/storage')

const uploadToGoogleCloudStorage = async (
    file: UploadedFile,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id']
) => {
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
}

const uploadToCloudinary = async (
    file: UploadedFile,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id']
) => {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: `${userID}/${noteID}`
    })
    return result.secure_url as string
}

/**
 * Async function that uploads a file to one of the storage providers and returns the file's URL.
 * @param file file to be uploaded
 * @param userID id of the file's owner
 * @param noteID id of the note where the attachment is created
 * @param env the current environment of the app, based on which the storage service is chosen
 */
const uploadFile = (
    file: UploadedFile,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id'],
    env: string
) => {
    if (env === 'production') {
        return uploadToGoogleCloudStorage(file, userID, noteID)
    }
    return uploadToCloudinary(file, userID, noteID)
}

export default uploadFile
