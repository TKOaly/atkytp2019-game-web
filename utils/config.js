if (process.env.NODE_ENV === 'development') {
    require('dotenv').config()
}

let port = process.env.PORT
let mongoUri = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'test') {
    port = process.env.TEST_PORT
    mongoUrl = process.env.TEST_MONGODB_URI
}

module.exports = {
    mongoUri,
    port
}