import express, { Application, Response, Request } from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'
import compression from 'compression'
import constants from './config/constants.config'
import rateLimiting from './middlewares/rateLimiting.middleware'
import send404 from './middlewares/send404.middleware'
import authRoute from './routes/auth.route'
import noteRoute from './routes/note.route'
import notepadRoute from './routes/notepad.route'
import sharedRoute from './routes/share.route'
import createResponse from './utils/createResponse.util'
import helmet from 'helmet'
import errorHandler from './middlewares/errorHandler.middleware'
import hpp from 'hpp'
import moesifLoggingMiddleware from './config/moesif.config'
import session from 'express-session'
import { RedisClient } from './config/RedisClient'
const cloudinary = require('cloudinary').v2

const app: Application = express()
app.set('env', constants.nodeEnv)
app.set('trust proxy', true)

cloudinary.config({
    cloud_name: constants.storage.cloudinary.name,
    api_key: constants.storage.cloudinary.key,
    api_secret: constants.storage.cloudinary.secret
})

app.use(helmet())
app.disable('etag')
app.use(compression())
app.use(morgan(app.get('env') === 'production' ? 'combined' : 'dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(hpp())

// Only needed when running the server and frontend on different (sub)domains.

app.use(cors({
    origin: constants.domain.whitelist,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE']
}))

app.use(session({
    store: RedisClient.getStore(),
    secret: constants.authentication.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: constants.authentication.authCookieAge,
        httpOnly: true,
        sameSite: 'lax',
        secure: constants.protocol === 'https',
        domain: constants.nodeEnv === 'production' ? constants.domain.baseDomain : undefined
    }
}))

if (app.get('env') === 'production') {
    app.use(moesifLoggingMiddleware)
    app.use(rateLimiting.forRequests)
}

app.use('/auth', authRoute)
app.use('/notes', noteRoute)
app.use('/notepads', notepadRoute)
app.use('/shared', sharedRoute)

app.get('/', (req: Request, res: Response) => createResponse(res, 200))

app.use(send404)

app.use(errorHandler)

export default app
