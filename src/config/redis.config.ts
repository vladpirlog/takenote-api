import { RedisClient } from 'redis'
import { promisify } from 'util'

class RedisClientWithPromises extends RedisClient {
    promiseGet (key: string) {
        return promisify(this.get).call(this, key)
    }

    promiseSetex (key: string, seconds: number, value: string) {
        return promisify(this.setex).call(this, key, seconds, value)
    }

    promiseDel (key: string | string[]) {
        // @ts-ignore
        return promisify(this.del).call(this, key)
    }

    promiseIncr (key: string) {
        return promisify(this.incr).call(this, key)
    }

    promiseQuit () {
        return promisify(this.quit).call(this)
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
