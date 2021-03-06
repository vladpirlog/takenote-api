import dotenv from 'dotenv'
dotenv.config()

const protocol = process.env.PROTOCOL || 'http'
const baseDomain = process.env.BASE_DOMAIN || 'localhost'
const apiDomain = process.env.API_DOMAIN || 'api.localhost'
const staticDomain = process.env.STATIC_DOMAIN || 'static.localhost'
const domain = {
    baseDomain,
    baseURL: `${protocol}://${baseDomain}`,
    apiDomain,
    apiURL: `${protocol}://${apiDomain}`,
    staticDomain,
    staticURL: `${protocol}://${staticDomain}`,
    whitelist: [`${protocol}://${baseDomain}`, `${protocol}://www.${baseDomain}`]
}

export default {
    port: process.env.PORT || '8000',
    nodeEnv: process.env.NODE_ENV || 'development',
    protocol,
    domain,
    mongodbURI: process.env.MONGODB_URI || '',
    storage: {
        cloudinary: {
            name: process.env.CLOUDINARY_CLOUD_NAME || '',
            key: process.env.CLOUDINARY_API_KEY || '',
            secret: process.env.CLOUDINARY_API_SECRET || ''
        },
        google: {
            bucketName: process.env.GOOGLE_BUCKET_NAME || ''
        }
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
    },
    moesif: {
        apiKey: process.env.MOESIF_API_KEY || ''
    },
    authentication: {
        cookieSecret: process.env.AUTH_COOKIE_SECRET || 'secret',
        authCookieAge: 2 * 60 * 60 * 1000, // time in ms
        tfaRememberDuration: 30 * 24 * 60 * 60, // time in s
        numberOfBackupCodes: 8,
        backupCodeLength: 10,
        oauth: {
            google: {
                redirectURI: `${domain.baseURL}/oauth/google`,
                discoveryDocument: 'https://accounts.google.com/.well-known/openid-configuration',
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
            }
        },
        recaptcha: {
            siteKey: process.env.RECAPTCHA_SITE_KEY || '',
            secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
            verificationEndpoint: 'https://www.google.com/recaptcha/api/siteverify'
        }
    },
    regex: {
        password: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]).{8,40}$/
    },
    mimeTypes: {
        image: ['image/jpeg', 'image/png'],
        audio: ['audio/aac', 'audio/x-aac', 'audio/mpeg', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/webm', 'video/webm']
    },
    idInfo: {
        user: { prefix: 'usr', length: 24 },
        note: { prefix: 'not', length: 24 },
        notepad: { prefix: 'npd', length: 24 },
        attachment: { prefix: 'att', length: 24 },
        drawing: { prefix: 'drw', length: 24 },
        jwt: { prefix: 'jwt', length: 24 },
        share: { prefix: 'shr', length: 24 },
        reset: { prefix: 'rst', length: 24 },
        confirmation: { prefix: 'cnf', length: 24 },
        comment: { prefix: 'com', length: 32 },
        tfa: { prefix: 'tfa', length: 48 }
    },
    email: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        host: process.env.EMAIL_HOST || '',
        port: parseInt(process.env.EMAIL_PORT || ''),
        secure: process.env.EMAIL_SECURE === 'true'
    },
    limits: {
        perUser: {
            request: 100, // # of requests per minute from an IP addr
            email: 4, // # of emails per minute sent to an IP addr
            notes: 1000,
            notepads: 100
        },
        perNote: {
            attachments: 10,
            drawings: 10,
            collaborators: 10,
            tags: 20
        }
    },
    token: {
        expires: 30 * 60 * 1000 // time in ms
    },
    test: {
        mongodbURI: process.env.MONGODB_TESTING_URI || '',
        redis: {
            host: process.env.REDIS_TESTING_HOST || '127.0.0.1',
            port: process.env.REDIS_TESTING_PORT ? parseInt(process.env.REDIS_TESTING_PORT) : 6379
        }
    }
}
