import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import deleteFile from '../utils/deleteFile.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'

/**
 * Function that returns a middleware function that checks if the request parameters have certain fields.
 * @param fields a string array representing the properties that the req.params needs to have
 */
const checkParams = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f => isPropertyOfObject(f, req.params))) {
            return next()
        }
        if (req.files?.photo) deleteFile(req.files?.photo)
        return createResponse(res, 422, 'Input data missing from URL path.')
    }
}

export default checkParams
