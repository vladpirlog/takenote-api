import { Request } from 'express'
import constants from './constants.config'
const moesif = require('moesif-nodejs')

const moesifLoggingMiddleware = moesif({
    applicationId: constants.moesif.apiKey,
    logBody: false,
    identifyUser: (req: Request) => req.session.userID || 'guest',
    skip: (req: Request) => req.path === '/'
})

export default moesifLoggingMiddleware
