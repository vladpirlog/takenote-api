# TakeNote REST API

The REST API of a note-taking application. Create notes, add photo attachments and share them for the world to see.

[![Node.js CI](https://github.com/vladpirlog/takenote-api/workflows/Node.js%20CI/badge.svg)](https://github.com/vladpirlog/takenote-api/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/316551b9d8d1679e51b0/maintainability)](https://codeclimate.com/github/vladpirlog/takenote-api/maintainability)
[![Dependencies](https://img.shields.io/david/vladpirlog/takenote-api)](package.json)
[![Standard](https://img.shields.io/badge/code%20style-standard-brightgreen?style=flat)](https://www.npmjs.com/package/eslint)
[![Language](https://img.shields.io/github/languages/top/vladpirlog/takenote-api)](https://github.com/vladpirlog/takenote-api)
[![License](https://img.shields.io/github/license/vladpirlog/takenote-api)](LICENSE)

## Getting Started

### Clone and cd into this repository

```bash
git clone https://github.com/vladpirlog/takenote-api.git
cd takenote-api
```

### Install the dependencies

```bash
npm install
```

### Build the app

NodeJS cannot run the TypeScript files natively. They must be transpiled into JavaScript using the settings from the [config file](tsconfig.json).

```bash
npm run build
```

### Run the app

```bash
npm start
```

An instance of the app will run be running at `http://localhost:8000/` using the [PM2](https://pm2.keymetrics.io/) process manager.

## Using Redis

A Redis server must be running locally on the default port (127.0.0.1:6379). Read the Redis [documentation](https://redis.io/documentation) for more info.

### Download, extract and compile Redis ([source](https://redis.io/download#installation))

```bash
wget http://download.redis.io/releases/redis-6.0.5.tar.gz
tar xzf redis-6.0.5.tar.gz
cd redis-6.0.5
make
```

### Environment variables

A set of environment variables must be provided in order for the app to run.

-   PORT - port to run the application on; defaults to `8000`
-   NODE_ENV - NodeJS environment; defaults to `development`
-   MONGODB_URI - MongoDB connection string for a local or cloud-hosted database
-   MONGODB_TESTING_URI - MongoDB connection string for testing purposes
-   AUTH_JWT_SECRET - key for symmetrically encrypting the JWTs; defaults to `jwt_secret`
-   CLOUDINARY_API_KEY - API key provided by the Cloudinary platform
-   CLOUDINARY_API_SECRET - API secret provided by the Cloudinary platform
-   CLOUDINARY_CLOUD_NAME - cloud name provided by the Cloudinary platform
-   GOOGLE_APPLICATION_CREDENTIALS - path to key for GCP service account with Storage Object Creator role
-   GOOGLE_BUCKET_NAME - name of the Google Cloud Storage bucket
-   EMAIL_USER - email address to send emails from
-   EMAIL_PASS - email password associated to that address
-   EMAIL_HOST - hostname of the mail server
-   EMAIL_PORT - port to be used for sending mail
-   EMAIL_SECURE - if true, the connection will use TLS; defaults to `false`
-   GOOGLE_CLIENT_ID - the OAuth client ID provided by Google
-   GOOGLE_CLIENT_SECRET - the OAuth client secret provided by Google
-   RECAPTCHA_SITE_KEY - reCAPTCHA site key provided by Google
-   RECAPTCHA_SITE_SECRET - reCAPTCHA site secret provided by Google

## Documentation

The full OpenAPI 3.0 documentation is available on [SwaggerHub](https://app.swaggerhub.com/apis/vladpirlog/takenote-api/1.0.0) or as a [YAML](42c-conf.yaml) file.

## Using a web server

The API is meant to be consumed by a front-end application. For best results, a web server (Apache, Nginx) should run in front of the NodeJS server as a reverse proxy, while serving the static files of the front-end app.

## Linter and formatter

Fix the code using eslint with the StandardJS style preset:

```bash
npm run lint
```

## Run the tests

```bash
npm test
```

## Built With

-   [NodeJS](https://nodejs.org/) - JavaScript runtime environment
-   [Express](https://expressjs.com/) - lightweight web framework for NodeJS
-   [TypeScript](https://www.typescriptlang.org/) - a superset of JavaScript developed by Microsoft
-   [Jest](https://jestjs.io/) - testing framework developed by Facebook
-   [MongoDB](https://www.mongodb.com/) - NoSQL database
-   [Cloudinary](https://cloudinary.com/) - image hosting platform

## Features

-   rate limiting for throttling requests
-   JWT cookie and Google OAuth 2.0 authentication flows
-   two-factor authentication using app-generated OTP
-   validation for reCAPTCHA v2 invisible
-   email confirmation when registering or resetting password

## Authors

-   **Vlad Pirlog** - [vladpirlog](https://github.com/vladpirlog) on Github

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
