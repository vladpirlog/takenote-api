import redis, { RedisClient } from 'redis'

let redisClient: RedisClient

/**
 * Creates a client for a Redis server. Returns a promise.
 */
const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        redisClient = redis.createClient()
        redisClient
            .on('error', (err) => reject(err))
            .on('connect', () => resolve())
    })
}

/**
 * Quits the currently open Redis client. Returns a promise.
 */
const close = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        redisClient.quit((err, ok) => {
            if (err) return reject(err)
            if (ok === 'OK') return resolve()
            return reject(new Error('Failed to close the redis client.'))
        })
    })
}

/**
 * Returns a promise for the currently open Redis client.
 */
const getClient = (): Promise<RedisClient> => {
    return new Promise((resolve, reject) => {
        if (redisClient) return resolve(redisClient)
        return reject(new Error('Redis client is undefined.'))
    })
}

export default { connect, close, getClient }
