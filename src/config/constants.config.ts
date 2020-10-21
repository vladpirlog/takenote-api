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
    moesif: {
        apiKey: process.env.MOESIF_API_KEY || ''
    },
    authentication: {
        authJWTSecret: process.env.AUTH_JWT_SECRET || 'jwt_secret',
        authCookieAge: 2 * 60 * 60 * 1000, // time in ms
        tfaTempCookieAge: 15 * 60 * 1000, // time in ms
        tfaRememberDuration: 30 * 24 * 60 * 60, // time in s
        authCookieName: 'access_token',
        tfaTempCookieName: 'temp_token',
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
        username: /^[a-zA-Z0-9_-]{4,16}$/,
        email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.,/\\])[A-Za-z\d@$!%*?&\-_.,/\\]{8,24}$/,
        attachment: {
            title: /^[ -~]{0,32}$/,
            description: /^[ -~]{0,256}$/
        },
        note: {
            title: /^[ -~]{0,100}$/,
            content: /^[ -~\s]{0,10000}$/,
            color: /^#[0-9a-fA-F]{6}$/
        },
        tag: /^[ -~]{1,20}$/
    },
    idInfo: {
        user: { prefix: 'u', length: 24 },
        note: { prefix: 'n', length: 24 },
        attachment: { prefix: 'a', length: 24 },
        jwt: { prefix: 'j', length: 24 },
        share: { prefix: 's', length: 24 },
        reset: { prefix: 'rs', length: 24 },
        confirmation: { prefix: 'cn', length: 24 },
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
            notes: 1000
        },
        perNote: {
            attachments: 10,
            collaborators: 10,
            tags: 20
        }
    },
    token: {
        expires: 30 * 60 * 1000 // time in ms
    },
    test: {
        persistentUser: {
            // a user which isn't deleted from the testing db
            email: 'Fludersomand31@einrot.com',
            username: 'test',
            password: 'Qwerty1!'
        },
        persistentUser2: {
            email: 'xiteson610@wwmails.com',
            username: 'test2',
            password: 'Qwerty1!'
        },
        acceptedCredentials: {
            // valid credentials used for testing the auth flows
            email: 'Hons1948@fleckens.hu',
            username: 'test1234',
            password: 'Qwerty1!'
        },
        wrongCredentials: {
            // invalid credentials used for testing the auth flows
            email: '(^&*%*HB*GUHI',
            username: 'aa',
            password: 'password'
        },
        mongodbURI: process.env.MONGODB_TESTING_URI || ''
    }
}
