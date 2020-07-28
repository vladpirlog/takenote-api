import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import deleteFile from '../utils/deleteFile.util'

/**
 * Function that returns a middleware function that checks if the request parameters have certain fields.
 * @param fields a string array representing the properties that the req.params needs to have
 */
export default function checkParams (fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            fields.length &&
            fields.every((field) => Object.keys(req.params).includes(field))
        ) { return next() }
        if (req.files?.photo) deleteFile(req.files?.photo)
        return createResponse(
            res,
            422,
            'Input data missing from URL path.'
        )
    }
}
