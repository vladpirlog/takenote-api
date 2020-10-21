import { Request, Response } from 'express'
import getAuthUser from '../utils/getAuthUser.util'
import constants from './constants.config'
const moesif = require('moesif-nodejs')

const moesifLoggingMiddleware = moesif({
    applicationId: constants.moesif.apiKey,
    logBody: false,
    identifyUser: (req: Request, res: Response) => getAuthUser(res).id || 'guest',
    skip: (req: Request) => req.path === '/'
})

export default moesifLoggingMiddleware
