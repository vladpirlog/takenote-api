import { Request, Response, NextFunction } from 'express'
import createResponse from '../utils/createResponse.util'
import { IRateLimiting } from '../interfaces/rateLimiting.interface'
import getUnixTime from '../utils/getUnixTime.util'
import constants from '../config/constants.config'
import redisConfig from '../config/redis.config'

const rateLimiting = (type: 'request' | 'email') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = `${req.ip}--${type}`
            const redisClient = await redisConfig.getClient()
            const reply: string = await new Promise((resolve, reject) => {
                redisClient.get(key, (err, reply) => err ? reject(err) : resolve(reply))
            })
            let data: IRateLimiting
            let blockRequest = false

            if (reply) {
                data = JSON.parse(reply)
                if (data.counter >= constants.rateLimiting[type]) {
                    if (getUnixTime() - data.unixTime < 60) {
                        data.counter++
                        blockRequest = true
                    } else { data = { counter: 1, unixTime: getUnixTime() } }
                } else { data.counter++ }
            } else { data = { counter: 1, unixTime: getUnixTime() } }

            redisClient.setex(key, 60, JSON.stringify(data))
            if (type === 'request') {
                res.setHeader(
                    'X-RateLimit-Remaining-Minute',
                    Math.max(0, constants.rateLimiting.request - data.counter)
                )
                res.setHeader('X-RateLimit-Limit-Minute', constants.rateLimiting.request)
            }
            return blockRequest ? createResponse(res, 429) : next()
        } catch (err) { return next(err) }
    }
}

export default { forRequests: rateLimiting('request'), forEmail: rateLimiting('email') }
