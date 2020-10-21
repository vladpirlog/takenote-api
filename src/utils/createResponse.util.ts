import { Response } from 'express'
import httpErrors from 'http-errors'

/**
 * A function that creates a response with a standard template (message, status, and other custom fields).
 * If only the Response object and a status are given as arguments, the default status message is used.
 * @param res the Express response object used to send back data to the http request
 * @param statusCode the status code included in the response as the "status" field; defaults to 404
 * @param message a brief description of the response
 * @param others other props to be included in the response
 */
const createResponse = (
    res: Response,
    statusCode: number = 404,
    message?: string,
    others?: object
) => {
    return res.status(statusCode).json({
        status: statusCode,
        message: message || (statusCode < 300 ? 'OK' : httpErrors(statusCode).message),
        ...others
    })
}

export default createResponse
