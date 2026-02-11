#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app'
import http from 'http'
import constants from '../config/constants.config'
import mongodbConfig from '../config/mongodb.config'
import { RedisClient } from '../config/RedisClient'
const debug = require('debug')('takenote')

/**
 * Get port from environment and store in Express.
 */
const port: number = normalizePort(constants.port)

app.set('port', port)

/**
 * Create HTTP server.
 */
const server = http.createServer(app)

Promise.all([
    mongodbConfig.connect(),
    RedisClient.connect({ url: constants.redis.url })
]).then(() => {
    console.log('MongoDB and Redis connected...')

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
    server.on('close', onClosing)
}).catch(err => {
    console.error(err)
    process.exit(-1)
})

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val: string): number {
    const port: number = parseInt(val, 10)

    if (isNaN(port)) {
    // named pipe
        return 8000
    }

    if (port >= 0) {
    // port number
        return port
    }

    return 8000
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
    case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
    default:
        throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
    const addr = server.address()
    const bind =
        typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port
    debug('Listening on ' + bind)
    console.log('Listening on ' + bind + '...')
}

/**
 * Event listener for HTTP server "closing" event.
 */
function onClosing () {
    Promise
        .all([mongodbConfig.close(), RedisClient.quit()])
        .catch(console.error)
}
