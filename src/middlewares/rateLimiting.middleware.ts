import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IRateLimiting } from '../interfaces/rateLimiting.interface'
import getUnixTime from '../utils/getUnixTime.util'
import constants from '../config/constants.config'
import redisConfig from '../config/redis.config'
import { RedisClient } from 'redis'

const setRateLimitHeaders = (res: Response, data: IRateLimiting) => {
    const remainingRequests = constants.rateLimiting.request - data.request.counter
    res.setHeader(
        'X-RateLimit-Remaining-Minute',
        remainingRequests < 0 ? 0 : remainingRequests
    )
    res.setHeader('X-RateLimit-Limit-Minute', constants.rateLimiting.request)
    return res
}

const createNewEntry = (
    request: IRateLimiting['request']['counter'] | IRateLimiting['request'],
    email: IRateLimiting['email']['counter'] | IRateLimiting['email']
): IRateLimiting => {
    return {
        request: typeof request === 'number'
            ? {
                counter: request, unixTime: getUnixTime()
            } : request,
        email: typeof email === 'number'
            ? {
                counter: email, unixTime: getUnixTime()
            } : email
    }
}

const saveAndSetHeaders = (
    res: Response,
    redisClient: RedisClient,
    data: IRateLimiting,
    ipAddr: string,
    type: 'request' | 'email'
) => {
    redisClient.setex(ipAddr, 60, JSON.stringify(data))
    return type === 'request' ? setRateLimitHeaders(res, data) : res
}

const rateLimiting = (type: 'request' | 'email') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const redisClient = await redisConfig.getClient()
            const reply: string = await new Promise((resolve, reject) => {
                redisClient.get(req.ip, (err, reply) => err ? reject(err) : resolve(reply))
            })
            let data: IRateLimiting
            if (reply) {
                data = JSON.parse(reply)
                if (data[type].counter >= constants.rateLimiting[type]) {
                    if (getUnixTime() - data[type].unixTime < 60) {
                        data[type].counter++
                        res = saveAndSetHeaders(res, redisClient, data, req.ip, type)
                        return createResponse(res, 429)
                    } else {
                        data = createNewEntry(type === 'request' ? 1 : data.request,
                            type === 'email' ? 1 : data.email)
                    }
                } else { data[type].counter++ }
            } else { data = createNewEntry(type === 'request' ? 1 : 0, type === 'email' ? 1 : 0) }
            res = saveAndSetHeaders(res, redisClient, data, req.ip, type)
            return next()
        } catch (err) { return next(err) }
    }
}

export default { forRequests: rateLimiting('request'), forEmail: rateLimiting('email') }
