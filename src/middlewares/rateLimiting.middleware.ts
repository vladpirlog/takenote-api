import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import constants from '../config/constants.config'
import { IUserSchema } from '../types/User'
import { RedisClient } from '../config/RedisClient'

/**
 * Creates a redis key using the given arguments.
 * @param ip ip address of the request
 * @param type the type of rate limiting to be done
 * @param userID id of the user making the request; defaults to 'guest'
 */
const getKey = (ip: string, type: 'request' | 'email', userID: IUserSchema['id'] = 'guest') => {
    return `${userID}--${ip}--${type}`
}

/**
 * For request rate limiting, sets the custom headers.
 */
const setHeaders = (res: Response, counter: number) => {
    res.setHeader(
        'X-RateLimit-Remaining-Minute',
        Math.max(0, constants.limits.perUser.request - counter)
    )
    res.setHeader('X-RateLimit-Limit-Minute', constants.limits.perUser.request)
}

/**
 * Creates a new entry with the value 1 in the Redis database .
 */
const createNewEntry = async (key: string) => {
    await RedisClient.setex(key, 60, '1')
    return 1
}

/**
 * Increments an existing entry in the Redis database.
 */
const incrementExistingEntry = (key: string) => RedisClient.incr(key)

/**
 * Limits the number of requests or email that have to be sent to a given ip and user.
 * @param type the type of rate limiting to be done
 */
const rateLimiting = (type: 'request' | 'email') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = getKey(req.ip, type, res.locals?.user?.id)
            const counter = await RedisClient.get(key)

            const newCounter = counter
                ? await incrementExistingEntry(key)
                : await createNewEntry(key)
            if (type === 'request') setHeaders(res, newCounter)

            if (newCounter > constants.limits.perUser.request) {
                return createResponse(res, 429)
            }
            return next()
        } catch (err) { return next(err) }
    }
}

export default { forRequests: rateLimiting('request'), forEmail: rateLimiting('email') }
