import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'
import isString from '../utils/isString.util'

/**
 * Higher order function for checking if certain fields in a part of the request are strings.
 * @returns a middleware function
 * @param location the request property to make the check on
 * @param fields an array of params that must be defined
 */
const requestFieldsDefined = (location: 'body' | 'params' | 'query', fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f => isPropertyOfObject(f, req[location]) && isString(req[location][f]))) {
            return next()
        }
        return createResponse(res, 422)
    }
}

export default requestFieldsDefined
