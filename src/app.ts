import express, { Application, Response, Request } from 'express'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import compression from 'compression'
import constants from './config/constants.config'
import extractUserFromCookie from './middlewares/extractUserFromCookie.middleware'
import rateLimiting from './middlewares/rateLimiting.middleware'
import send404 from './middlewares/send404.util'
import authRoute from './routes/auth.route'
import noteRoute from './routes/note.route'
import sharedNoteRoute from './routes/note.share.route'
import createResponse from './utils/createResponse.util'
import helmet from 'helmet'
import errorHandler from './middlewares/errorHandler.middleware'
const cloudinary = require('cloudinary').v2

/**
 * A Redis server must be running locally on the default port (127.0.0.1:6379)
 */

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
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    fileUpload({
        tempFileDir: './temp/',
        useTempFiles: true
    })
)

// Only needed when running the server and frontend on different (sub)domains.

app.use(cors({
    origin: /* constants.domain.whitelist */ 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE']
}))

app.use(extractUserFromCookie)
app.use(rateLimiting.forRequests)

app.use('/auth', authRoute)
app.use('/notes', noteRoute)
app.use('/shared', sharedNoteRoute)

app.get('/status', (req: Request, res: Response) => {
    return createResponse(res, 200)
})

app.use(send404)

app.use(errorHandler)

export default app
