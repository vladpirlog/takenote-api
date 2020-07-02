import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Function that returns a middleware function that checks if the request queries have certain fields.
 * @param fields a string array representing the properties that the req.query needs to have
 */
export default function checkQuery (fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            fields.length &&
            fields.every((field) => Object.keys(req.query).includes(field))
        ) { return next() }
        return createResponse(res, 422, 'Input data missing from URL queries.')
    }
}
