import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IRateLimiting } from '../interfaces/rateLimiting.interface'
import getUnixTime from '../utils/getUnixTime.util'
import constants from '../config/constants'
import redisConfig from '../config/redis.config'

const forRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const redisClient = await redisConfig.getClient()
        redisClient.get(req.ip, (err, reply) => {
            if (err) throw err
            res.setHeader(
                'X-RateLimit-Limit-Minute',
                constants.rateLimiting.requestsPerMin
            )
            if (reply) {
                const data: IRateLimiting = JSON.parse(reply)
                if (
                    data.requests.counter >=
                    constants.rateLimiting.requestsPerMin
                ) {
                    if (getUnixTime() - data.requests.unixTime < 60) {
                        data.requests.counter++
                        redisClient.setex(req.ip, 60, JSON.stringify(data))
                        res.setHeader(
                            'X-RateLimit-Remaining-Minute',
                            constants.rateLimiting.requestsPerMin -
                                data.requests.counter <
                                0
                                ? 0
                                : constants.rateLimiting.requestsPerMin -
                                      data.requests.counter
                        )
                        return createResponse(
                            res,
                            429,
                            'Request threshold has been reached.'
                        )
                    } else {
                        const newEntry: IRateLimiting = {
                            requests: {
                                counter: 1,
                                unixTime: getUnixTime()
                            },
                            email: data.email
                        }
                        redisClient.setex(req.ip, 60, JSON.stringify(newEntry))
                        res.setHeader(
                            'X-RateLimit-Remaining-Minute',
                            constants.rateLimiting.requestsPerMin -
                                newEntry.requests.counter <
                                0
                                ? 0
                                : constants.rateLimiting.requestsPerMin -
                                      newEntry.requests.counter
                        )
                    }
                } else {
                    data.requests.counter++
                    redisClient.setex(req.ip, 60, JSON.stringify(data))
                    res.setHeader(
                        'X-RateLimit-Remaining-Minute',
                        constants.rateLimiting.requestsPerMin -
                            data.requests.counter <
                            0
                            ? 0
                            : constants.rateLimiting.requestsPerMin -
                                  data.requests.counter
                    )
                }
            } else {
                const newEntry: IRateLimiting = {
                    requests: {
                        counter: 1,
                        unixTime: getUnixTime()
                    },
                    email: {
                        counter: 0,
                        unixTime: getUnixTime()
                    }
                }
                redisClient.setex(req.ip, 60, JSON.stringify(newEntry))
                res.setHeader(
                    'X-RateLimit-Remaining-Minute',
                    constants.rateLimiting.requestsPerMin -
                        newEntry.requests.counter <
                        0
                        ? 0
                        : constants.rateLimiting.requestsPerMin -
                              newEntry.requests.counter
                )
            }
            return next()
        })
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

const forEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const redisClient = await redisConfig.getClient()
        redisClient.get(req.ip, (err, reply) => {
            if (err) throw err
            if (reply) {
                const data: IRateLimiting = JSON.parse(reply)
                if (data.email.counter >= constants.rateLimiting.emailsPerMin) {
                    if (getUnixTime() - data.email.unixTime < 60) {
                        data.email.counter++
                        redisClient.setex(req.ip, 60, JSON.stringify(data))
                        return createResponse(
                            res,
                            429,
                            'Email threshold has been reached.'
                        )
                    } else {
                        const newEntry: IRateLimiting = {
                            requests: data.requests,
                            email: {
                                counter: 1,
                                unixTime: getUnixTime()
                            }
                        }
                        redisClient.setex(req.ip, 60, JSON.stringify(newEntry))
                    }
                } else {
                    data.email.counter++
                    redisClient.setex(req.ip, 60, JSON.stringify(data))
                }
            } else {
                const newEntry: IRateLimiting = {
                    requests: {
                        counter: 0,
                        unixTime: getUnixTime()
                    },
                    email: {
                        counter: 1,
                        unixTime: getUnixTime()
                    }
                }
                redisClient.setex(req.ip, 60, JSON.stringify(newEntry))
            }
            return next()
        })
    } catch (err) {
        return createResponse(res, 500, err.message, { error: err })
    }
}

export default { forRequests, forEmail }
