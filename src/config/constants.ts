import dotenv from 'dotenv'
dotenv.config()

export default {
    port: process.env.PORT || '8000',
    nodeEnv: process.env.NODE_ENV || 'development',
    domain: {
        baseDomain: process.env.BASE_DOMAIN || 'localhost',
        apiDomain: process.env.API_DOMAIN || 'api.localhost'
    },
    mongodbURI: process.env.MONGODB_URI || '',
    cloudinary: {
        name: process.env.CLOUDINARY_CLOUD_NAME || '',
        key: process.env.CLOUDINARY_API_KEY || '',
        secret: process.env.CLOUDINARY_API_SECRET || ''
    },
    authentication: {
        jwtSecret: process.env.JWT_SECRET || '',
        expires: 2 * 60 * 60 * 1000 // time in ms
    },
    regex: {
        username: /^[a-zA-Z0-9_-]{4,16}$/,
        email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-_.,/\\])[A-Za-z\d@$!%*?&-_.,/\\]{8,24}$/
    },
    sharing: {
        codeLength: 20
    },
    rateLimiting: {
        request: 100, // # of requests per minute from an IP addr
        email: 8 // # of emails per minute sent to an IP addr
    },
    email: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    },
    token: {
        expires: 30 * 60 * 1000, // time in ms
        confirmationLength: 24,
        resetLength: 32,
        forgotLength: 32
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
