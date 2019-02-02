const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const middleware = require('./utils/middleware')
const config = require('./utils/config')

const highscoreRouter = require('./controllers/highscores')

mongoose.set('useCreateIndex', true)
mongoose.connect(config.mongoUri, { useNewUrlParser: true })

app.use(cors())
app.use(bodyParser.json())
app.use(middleware.logger)

app.use('/api/highscores', highscoreRouter)

app.use(middleware.error)

const server = http.createServer(app)

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
    mongoose.connection.close()
})

module.exports = {
    app, server
}