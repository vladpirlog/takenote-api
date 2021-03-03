import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { promisify } from 'util'

export class RedisClient {
    private static _client: redis.RedisClient
    private static _store: connectRedis.RedisStore

    static getClient () {
        return this._client
    }

    static getStore () {
        return this._store
    }

    static connect (options: redis.ClientOpts = {}) {
        this._client = new redis.RedisClient(options)
        const RedisStore = connectRedis(session)
        this._store = new RedisStore({ client: this._client })
    }

    static get (key: string) {
        return promisify(this._client.get).call(this._client, key)
    }

    static setex (key: string, seconds: number, value: string) {
        return promisify(this._client.setex).call(this._client, key, seconds, value)
    }

    static del (key: string | string[]) {
        // @ts-ignore
        return promisify(this._client.del).call(this._client, key)
    }

    static incr (key: string) {
        return promisify(this._client.incr).call(this._client, key)
    }

    static quit () {
        return promisify(this._client.quit).call(this._client)
    }
}
