import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'

/**
 * Function that returns a middleware function that checks if the request query has certain fields.
 * @param fields a string array representing the properties that req.query needs to have
 */
const checkQuery = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f => isPropertyOfObject(f, req.query))) {
            return next()
        }
        return createResponse(res, 422, 'Input data missing from URL queries.')
    }
}

export default checkQuery
