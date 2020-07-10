import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    return createResponse(res, 500, err.message)
}

export default errorHandler
