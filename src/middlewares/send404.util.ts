import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Middleware function that sends a 404 response to all the request that didn't match any other route.
 * It's the last function in the middleware stack.
 */
export default function (req: Request, res: Response) {
    return createResponse(res)
}
