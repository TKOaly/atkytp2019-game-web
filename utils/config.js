if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

let port = process.env.PORT
let mongoUri = process.env.MONGODB_URI

module.exports = {
    mongoUri,
    port
}