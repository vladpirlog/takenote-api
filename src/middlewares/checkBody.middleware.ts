import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import isPropertyOfObject from '../utils/isPropertyOfObject.util'

/**
 * Function that returns a middleware that checks if the request body includes the mandatory fields.
 * @param fields a string array representing the fields that the body needs to have
 */
const checkBody = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (fields.every(f => isPropertyOfObject(f, req.body))) {
            return next()
        }
        return createResponse(res, 422, 'Input data missing from body.')
    }
}

export default checkBody
