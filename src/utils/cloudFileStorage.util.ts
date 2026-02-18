import constants from '../config/constants.config'
import { INoteSchema } from '../types/Note'
import { Storage } from '@google-cloud/storage'
import { v2 as cloudinary } from 'cloudinary'

const uploadFileToGoogleCloudStorage = async (
    filePath: string,
    fileDestination: string
) => {
    const storage = new Storage()
    const options = {
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000'
        },
        destination: fileDestination
    }

    const [result] = await storage.bucket(constants.storage.google.bucketName).upload(filePath, options)
    const [metadata] = await result.getMetadata()

    return encodeURI(`${constants.domain.staticURL}/${metadata.name}`)
}

const uploadFileToCloudinary = async (
    filePath: string,
    fileDestination: string,
    fileType: 'image' | 'audio'
) => {
    const result = await cloudinary.uploader.upload(filePath, {
        public_id: fileDestination,
        resource_type: fileType === 'image' ? 'image' : 'video'
    })
    return result.secure_url as string
}

/**
 * Async function that uploads a file to one of the storage providers.
 * @param filePath the path to the file to be uploaded
 * @param fileDestination the destination where the file will be uploaded (directories and file name, separated by slashes)
 * @param fileType the type of file to upload
 * @param env the current environment of the app, based on which the storage service is chosen
 * @returns the uploaded file's URL
 */
export const uploadFileToCloudStorage = (
    filePath: string,
    fileDestination: string,
    fileType: 'image' | 'audio',
    env: string
) => {
    if (env === 'production') {
        return uploadFileToGoogleCloudStorage(filePath, fileDestination)
    }
    return uploadFileToCloudinary(filePath, fileDestination, fileType)
}

const deleteFileFromGoogleCloudStorage = async (filePath: string) => {
    try {
        const storage = new Storage()
        await storage
            .bucket(constants.storage.google.bucketName)
            .file(filePath)
            .delete()
        return true
    } catch { return false }
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
    } catch { return false }
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
    } catch { return false }
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
    } catch { return false }
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
