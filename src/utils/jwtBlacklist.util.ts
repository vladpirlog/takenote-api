import getUnixTime from './getUnixTime.util'
import redisConfig from '../config/redis.config'

/**
 * Blacklists JWT until the original expiration time of the token.
 * @param jwtID id of the access JWT
 * @param expTime expiration unix time of the JWT
 */
const add = (jwtID: string, expTime: number) => redisConfig
    .getClient()
    .promiseSetex(jwtID, expTime - getUnixTime(), '1')

/**
 * Checks if the JWT is valid or has been blacklisted.
 * @param jwtID id of the access JWT
 * @returns true if the JWT is valid, false if it's blacklisted
 */
const check = (jwtID: string) => redisConfig
    .getClient()
    .promiseGet(jwtID).then(val => !val)

export default { add, check }
