import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Function that returns a middleware that checks if the request body includes the mandatory fields.
 * @param fields a string array representing the fields that the body needs to have
 */
export default function checkBody (fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (
            fields.length &&
            fields.every((field) => Object.keys(req.body).includes(field))
        ) { return next() }
        return createResponse(res, 422, 'Input data missing from body.')
    }
}
