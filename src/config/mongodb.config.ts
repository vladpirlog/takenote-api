import mongoose from 'mongoose'
import constants from './constants.config'

/**
 * Creates a connection to a MongoDB database using mongoose. Returns a promise.
 * @param URI a mongodb connection URI
 */
const connect = (URI?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        mongoose
            .connect(URI || constants.mongodbURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true
            })
            .then(() => resolve())
            .catch((err) => reject(err))
    })
}

/**
 * Closes the current MongoDB connection. Returns a promise.
 */
const close = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        mongoose.connection
            .close()
            .then(() => {
                return resolve()
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export default { connect, close }
