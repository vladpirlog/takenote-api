import constants from './constants.config'
import moesif from 'moesif-nodejs'

const moesifLoggingMiddleware = moesif({
    applicationId: constants.moesif.apiKey,
    logBody: false,
    identifyUser: (req: object, _) => (req as { session: { userID: string | null | undefined } }).session.userID || 'guest',
    skip: (req: object, _) => (req as { path: string | null | undefined }).path === '/'
})

export default moesifLoggingMiddleware
