import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Function that returns a middleware function that checks if the request query fields aren't arrays.
 * @param fields a string array representing the properties that need to pass this test
 */
export default function checkQueryNotArray (fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            fields.length &&
            fields.every(
                (field) =>
                    !Object.keys(req.query).includes(field) ||
                    !Array.isArray(req.query[field])
            )
        ) { return next() }
        return createResponse(res, 422, 'One of the queries is an array.')
    }
}
