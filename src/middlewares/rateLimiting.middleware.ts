import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IRateLimiting } from '../interfaces/rateLimiting.interface'
import getUnixTime from '../utils/getUnixTime.util'
import constants from '../config/constants.config'
import redisConfig from '../config/redis.config'

const getKey = (req: Request, type: 'request' | 'email') => {
    return `${req.ip}--${type}`
}

const getValue = async (key: string) => {
    const redisClient = await redisConfig.getClient()
    const value: string = await new Promise((resolve, reject) => {
        redisClient.get(key, (err, reply) => err ? reject(err) : resolve(reply))
    })
    return value
}

const setHeaders = (res: Response, data: IRateLimiting) => {
    res.setHeader(
        'X-RateLimit-Remaining-Minute',
        Math.max(0, constants.limits.perUser.request - data.counter)
    )
    res.setHeader('X-RateLimit-Limit-Minute', constants.limits.perUser.request)
}

const writeToDatabase = async (key: string, data: IRateLimiting) => {
    const redisClient = await redisConfig.getClient()
    redisClient.setex(key, 60, JSON.stringify(data))
}

const createNewEntry = async (res: Response, key: string, type: 'request' | 'email') => {
    const data = { counter: 1, unixTime: getUnixTime() }

    await writeToDatabase(key, data)
    if (type === 'request') { setHeaders(res, data) }
}

const verifyExistingEntry = async (
    res: Response,
    key: string,
    value: string,
    type: 'request' | 'email'
) => {
    const data: IRateLimiting = JSON.parse(value)
    if (data.unixTime + 60 < getUnixTime()) {
        await createNewEntry(res, key, type)
        return false
    }
    data.counter++

    await writeToDatabase(key, data)
    if (type === 'request') { setHeaders(res, data) }

    return data.counter > constants.limits.perUser[type]
}

const rateLimiting = (type: 'request' | 'email') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = getKey(req, type)
            const value = await getValue(key)

            if (value) {
                const blockRequest = await verifyExistingEntry(res, key, value, type)
                return blockRequest ? createResponse(res, 429) : next()
            }
            await createNewEntry(res, key, type)
            return next()
        } catch (err) { return next(err) }
    }
}

export default { forRequests: rateLimiting('request'), forEmail: rateLimiting('email') }
