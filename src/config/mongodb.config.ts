import mongoose from 'mongoose'
import constants from './constants.config'

/**
 * Creates a connection to a MongoDB database using mongoose. Returns a promise.
 * @param URI a mongodb connection URI
 */
const connect = (URI?: string) => mongoose.connect(URI || constants.mongodbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

/**
 * Closes the current MongoDB connection. Returns a promise.
 */
const close = () => mongoose.connection.close()

export default { connect, close }
