import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'

export class RedisClient {
    private static _client: redis.RedisClientType<redis.RedisModules, redis.RedisFunctions, redis.RedisScripts, redis.RespVersions, redis.TypeMapping>
    private static _store: connectRedis.RedisStore

    static getClient () {
        return this._client
    }

    static getStore () {
        return this._store
    }

    static connect (options: redis.RedisClientOptions = {}) {
        this._client = redis.createClient(options)
        const RedisStore = connectRedis(session)
        this._store = new RedisStore({ client: this._client })
    }

    static get (key: string) {
        return this._client.get(key)
    }

    static setex (key: string, seconds: number, value: string) {
        return this._client.setEx(key, seconds, value)
    }

    static del (key: string | string[]) {
        return this._client.del(key)
    }

    static incr (key: string) {
        return this._client.incr(key)
    }

    static quit () {
        return this._client.quit()
    }
}
