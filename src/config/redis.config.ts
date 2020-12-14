import { RedisClient } from 'redis'
import { promisify } from 'util'

class RedisClientWithPromises extends RedisClient {
    promiseGet: (key: string) => Promise<string | null> = promisify(this.get).bind(this)
    promiseSetex: (key: string, seconds: number, value: string) => Promise<string> = promisify(this.setex).bind(this)
    promiseDel: (key: string) => Promise<number> = promisify(this.del).bind(this)
    promiseIncr: (key: string) => Promise<number> = promisify(this.incr).bind(this)
    promiseQuit: () => Promise<'OK'> = promisify(this.quit).bind(this)

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
