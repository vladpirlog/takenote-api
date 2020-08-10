import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'

/**
 * Function that returns a middleware function that checks if the request query fields aren't arrays.
 * @param fields a string array representing the properties that need to pass this test
 */
const checkQueryNotArray = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f =>
            !isPropertyOfObject(f, req.query) || !Array.isArray(req.query[f])
        )) {
            return next()
        }
        return createResponse(res, 422, 'One of the queries is an array.')
    }
}

export default checkQueryNotArray
