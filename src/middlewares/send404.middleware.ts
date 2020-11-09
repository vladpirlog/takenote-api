import { Request, Response } from 'express'
import createResponse from '../utils/createResponse.util'

/**
 * Middleware function that sends a 404 response to all the request that didn't match any other route.
 */
export default (req: Request, res: Response) => createResponse(res)
