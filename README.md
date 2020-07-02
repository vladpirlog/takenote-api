# TakeNote REST API

The REST API of a note-taking application. Create notes, add photo attachments and share them for the world to see.

[![Standard](https://img.shields.io/badge/code%20style-standard-brightgreen?style=flat)](https://www.npmjs.com/package/eslint)
[![License](https://img.shields.io/github/license/vladpirlog/takenote-api)](LICENSE)

## Getting Started

A Redis server must be running locally on the default port (127.0.0.1:6379). Read the Redis [documentation](https://redis.io/documentation) for more info.

### Download, extract and compile Redis ([source](https://redis.io/download#installation))

```bash
wget http://download.redis.io/releases/redis-6.0.5.tar.gz
tar xzf redis-6.0.5.tar.gz
cd redis-6.0.5
make
```

## Deploy

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

NodeJS cannot run the TypeScript files natively. They must be transpiled to vanilla JavaScript using the settings from the [config file](tsconfig.json).

```bash
npm run build
```

### Run the app

```bash
npm start
```

An instance of the app will run at `http://localhost:8000/` using the [PM2](https://pm2.keymetrics.io/) process manager.

### Environment variables

A set of environment variables must be provided in order for the app to run.

* PORT - port to run the application on; defaults to `8000`
* NODE_ENV - NodeJS environment; defaults to `development`
* MONGODB_URI - MongoDB connection string for a local or hosted database
* MONGODB_TESTING_URI - MongoDB connection string for testing purposes
* JWT_SECRET - key for symmetrically encrypting the JWTs
* CLOUDINARY_API_KEY - API key provided by the Cloudinary platform
* CLOUDINARY_API_SECRET - API secret provided by the Cloudinary platform
* CLOUDINARY_CLOUD_NAME - cloud name provided by the Cloudinary platform
* EMAIL_USER - email address to send emails from
* EMAIL_PASS - email password associated to that address

## Documentation

The full OpenAPI 3.0 documentation is available on [SwaggerHub](https://app.swaggerhub.com/apis/vladpirlog/takenote-express/1.0.0) or as a [YAML](openapi-docs.yaml) file.

## Using a web server

The API is meant to be consumed by a front-end application. For best results, a web server (Apache, Nginx) should run in front of the app as a reverse proxy, while serving the static files.

## Run the tests

```bash
npm test
```

## Built With

* [NodeJS](https://nodejs.org/) - JavaScript runtime environment
* [Express](https://expressjs.com/) - lightweight web framework for NodeJS
* [TypeScript](https://www.typescriptlang.org/) - a superset of JavaScript developed by Microsoft
* [Jest](https://jestjs.io/) - testing framework developed by Facebook
* [MongoDB](https://www.mongodb.com/) - NoSQL database
* [Cloudinary](https://cloudinary.com/) - image hosting platform

## Features

* rate limiting for throttling requests
* role-based access
* JWT cookie and OAuth 2.0 (soon) authentication flows
* email confirmation when registering or resetting password

## Authors

* **Vlad Pirlog** - [vladpirlog](https://github.com/vladpirlog) on Github

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
