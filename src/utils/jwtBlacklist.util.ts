import getUnixTime from './getUnixTime.util'
import redisConfig from '../config/redis.config'

/**
 * Blacklists JWT until the original expiration time of the token.
 * @param jwtID id of the access JWT
 * @param expTime expiration unix time of the JWT
 */
const add = async (jwtID: string, expTime: number): Promise<string> => {
    const redisClient = await redisConfig.getClient()
    return new Promise((resolve, reject) => {
        redisClient.setex(jwtID, expTime - getUnixTime(), '1', (err, reply) => {
            if (err) return reject(err)
            return resolve(reply)
        })
    })
}

/**
 * Async checks if the JWT is valid or has been blacklisted.
 * Returns a boolean (true means the jwt is valid).
 * @param jwtID id of the access JWT
 */
const check = async (jwtID: string): Promise<boolean> => {
    const redisClient = await redisConfig.getClient()
    return new Promise((resolve, reject) => {
        redisClient.get(jwtID, (err, reply) => {
            if (err) return reject(err)
            if (reply) return resolve(false)
            return resolve(true)
        })
    })
}

export default { add, check }
