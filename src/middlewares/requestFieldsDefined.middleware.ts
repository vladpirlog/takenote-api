import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'
import deleteFile from '../utils/deleteFile.util'

/**
 * Higher order function for checking the existence of certain fields in a part of the request.
 * @returns a middleware function
 * @param location the request property to make the check on
 * @param fields an array of params that must be defined
 */
const requestFieldsDefined = (location: 'body' | 'params' | 'query', fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f => isPropertyOfObject(f, req[location]))) {
            return next()
        }
        if (req.files?.photo) deleteFile(req.files.photo)
        return createResponse(res, 422, `Data missing from ${location}.`)
    }
}

export default requestFieldsDefined