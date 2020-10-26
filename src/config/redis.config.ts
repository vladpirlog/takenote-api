import { RedisClient } from 'redis'
import { promisify } from 'util'

class RedisClientWithPromises extends RedisClient {
    promiseGet (key: string) {
        return promisify(this.get).bind(this)(key)
    }

    promiseSetex (key: string, seconds: number, value: string) {
        return promisify(this.setex).bind(this)(key, seconds, value)
    }

    promiseDel (key: string | string[]) {
        // @ts-ignore
        return promisify(this.del).bind(this)(key)
    }

    promiseIncr (key: string) {
        return promisify(this.incr).bind(this)(key)
    }

    promiseQuit () {
        return promisify(this.quit).bind(this)()
    }

    constructor () {
        super({})
    }
}

let redisClient: RedisClientWithPromises

/**
 * Creates a client for a Redis server.
 */
const connect = () => {
    redisClient = new RedisClientWithPromises()
}

/**
 * Returns the current Redis client.
 */
const getClient = () => redisClient

/**
 * Quits the currently open Redis client. Returns a promise.
 */
const close = () => redisClient.promiseQuit()

export default { connect, close, getClient }
