import { IUserSchema } from '../types/User'
import constants from '../config/constants.config'
import { INoteSchema } from '../types/Note'
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
        destination: `${userID}/${noteID}/${filePath.split('/').pop()}`
    }

    const [result] = await storage.bucket(constants.storage.google.bucketName).upload(filePath, options)
    const [metadata] = await result.getMetadata()

    return encodeURI(`${constants.domain.staticURL}/${metadata.name}`)
}

const uploadToCloudinary = async (
    filePath: string,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id'],
    fileType: 'image' | 'audio'
) => {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: `${userID}/${noteID}`,
        resource_type: fileType === 'image' ? 'image' : 'video'
    })
    return result.secure_url as string
}

/**
 * Async function that uploads a file to one of the storage providers.
 * @param filePath the path to the file to be uploaded
 * @param userID id of the file's owner
 * @param noteID id of the note where the file is uploaded
 * @param fileType the type of file to upload
 * @param env the current environment of the app, based on which the storage service is chosen
 * @returns the uploaded file's URL
 */
export const uploadFileToCloudStorage = (
    filePath: string,
    userID: IUserSchema['id'],
    noteID: INoteSchema['id'],
    fileType: 'image' | 'audio',
    env: string
) => {
    if (env === 'production') {
        return uploadToGoogleCloudStorage(filePath, userID, noteID)
    }
    return uploadToCloudinary(filePath, userID, noteID, fileType)
}

const deleteFileFromGoogleCloudStorage = async (filePath: string) => {
    try {
        const storage = new Storage()
        await storage
            .bucket(constants.storage.google.bucketName)
            .file(filePath)
            .delete()
        return true
    } catch (err) { return false }
}

const deleteFileFromCloudinary = async (
    filePath: string,
    fileType: 'image' | 'audio'
) => {
    try {
        const result = await cloudinary.uploader.destroy(filePath, {
            resource_type: fileType === 'image' ? 'image' : 'video',
            invalidate: true
        })
        return result.result === 'ok'
    } catch (err) { return false }
}

/**
 * Async function that deletes a file from one of the storage providers.
 * @param filePath the path of the file to be deleted
 * @param fileType the type of resource that needs to be deleted
 * @param env the current environment of the app, based on which the storage service is chosen
 * @returns a boolean representing the final status of the operation
 */
export const deleteFileFromCloudStorage = (
    filePath: string,
    fileType: 'image' | 'audio',
    env: string
) => {
    if (env === 'production') {
        return deleteFileFromGoogleCloudStorage(filePath)
    }
    return deleteFileFromCloudinary(filePath, fileType)
}

const deleteFolderFromGoogleCloudStorage = async (noteID: INoteSchema['id']) => {
    try {
        const storage = new Storage()
        await storage
            .bucket(constants.storage.google.bucketName)
            .deleteFiles({ prefix: `${noteID}/` })
        return true
    } catch (err) { return false }
}

const deleteFolderFromCloudinary = async (noteID: INoteSchema['id']) => {
    try {
        await cloudinary.api.delete_resources_by_prefix(noteID, {
            invalidate: true
        })
        await cloudinary.api.delete_resources_by_prefix(noteID, {
            invalidate: true, resource_type: 'video'
        })
        await cloudinary.api.delete_folder(noteID)
        return true
    } catch (err) { return false }
}

/**
 * Async function that deletes a folder and its contents from one of the storage providers.
 * @param folderPath the path of the folder to be deleted
 * @param env the current environment of the app, based on which the storage service is chosen
 * @returns a boolean representing the final status of the operation
 */
export const deleteFolderFromCloudStorage = async (folderPath: string, env: string) => {
    if (env === 'production') {
        return deleteFolderFromGoogleCloudStorage(folderPath)
    }
    return deleteFolderFromCloudinary(folderPath)
}
