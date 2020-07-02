import { Response } from 'express'
import httpErrors from 'http-errors'

/**
 * A function that creates a response with a standard template (message, status, and other custom fields).
 * If only the Response object and optionally a status are given as arguments, the built-in sendStatus function is used.
 * @param res the Express response object used to send back data to the http request
 * @param statusCode the status code included in the response as the "status" field; defaults to 404
 * @param message a brief description of the response
 * @param others some other props to be included in the response
 */
export default function createResponse (
    res: Response,
    statusCode?: number,
    message?: string,
    others?: object
): Response {
    if (!message && !others && statusCode) {
        return res.status(statusCode).json({
            status: statusCode,
            message: statusCode < 300 ? 'OK' : httpErrors(statusCode).message
        })
    }
    if (!message && !others && !statusCode) {
        return res
            .status(404)
            .json({ status: 404, message: httpErrors(404).message })
    }
    return res.status(statusCode || 404).json({
        status: statusCode || 404,
        message: message || 'Not Found',
        ...others
    })
}
