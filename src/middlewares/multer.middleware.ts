import multer from 'multer'
import constants from '../config/constants.config'

export const multerImageMiddleware = multer({
    dest: './temp/',
    fileFilter: (req, file, callback) => {
        const accepted = constants.mimeTypes.image.includes(file.mimetype)
        return callback(null, accepted)
    },
    limits: {
        files: 1,
        fileSize: 8388608 // 8 MB
    }
})

export const multerAudioMiddleware = multer({
    dest: './temp/',
    fileFilter: (req, file, callback) => {
        const accepted = constants.mimeTypes.audio.includes(file.mimetype)
        return callback(null, accepted)
    },
    limits: {
        files: 1,
        fileSize: 12582912 // 12 MB
    }
})

export const multerDrawingMiddleware = multer({
    dest: './temp/',
    fileFilter: (req, file, callback) => {
        const accepted = file.mimetype === 'image/png'
        return callback(null, accepted)
    },
    limits: {
        files: 1,
        fileSize: 8388608 // 8 MB
    }
})
