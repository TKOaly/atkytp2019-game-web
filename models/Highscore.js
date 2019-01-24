const mongoose = require('mongoose')

const highscoreSchema = new mongoose.Schema({
    user: String,
    token: String,
    installationId: String,
    score: Number
})

const Highscore = mongoose.model('Highscore', highscoreSchema)

module.exports = Highscore