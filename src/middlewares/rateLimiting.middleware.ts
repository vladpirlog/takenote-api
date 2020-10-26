import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import constants from '../config/constants.config'
import redisConfig from '../config/redis.config'
import { IUserSchema } from '../types/User'

const getKey = (req: Request, type: 'request' | 'email', userID?: IUserSchema['id']) => {
    return `${userID || 'guest'}--${req.ip}--${type}`
}

const getValueFromKey = async (key: string) => {
    const redisClient = await redisConfig.getClient()
    const value: string | null = await new Promise((resolve, reject) => {
        redisClient.get(key, (err, reply) => err ? reject(err) : resolve(reply))
    })
    return value
}

const setHeaders = (res: Response, counter: number) => {
    res.setHeader(
        'X-RateLimit-Remaining-Minute',
        Math.max(0, constants.limits.perUser.request - counter)
    )
    res.setHeader('X-RateLimit-Limit-Minute', constants.limits.perUser.request)
}

const createNewEntry = async (key: string) => {
    const redisClient = await redisConfig.getClient()
    await new Promise((resolve, reject) => {
        redisClient.setex(key, 60, '1', (err, res) => {
            if (err) return reject(err)
            return resolve(res)
        })
    })
    return 1
}

const incrementExistingEntry = async (key: string) => {
    const redisClient = await redisConfig.getClient()
    const newValue: number = await new Promise((resolve, reject) => {
        redisClient.incr(key, (err, res) => {
            if (err) return reject(err)
            return resolve(res)
        })
    })
    return newValue
}

const rateLimiting = (type: 'request' | 'email') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = getKey(req, type, res.locals?.user?.id)
            const value = await getValueFromKey(key)
            const newValue = value
                ? await incrementExistingEntry(key)
                : await createNewEntry(key)

            if (type === 'request') setHeaders(res, newValue)
            return newValue > constants.limits.perUser.request
                ? createResponse(res, 429)
                : next()
        } catch (err) { return next(err) }
    }
}

export default { forRequests: rateLimiting('request'), forEmail: rateLimiting('email') }
