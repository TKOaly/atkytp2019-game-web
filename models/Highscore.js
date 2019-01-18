const mongoose = require('mongoose')

const highscoreSchema = new mongoose.Schema({
    name: String,
    token: String,
    score: Number
})

const Highscore = mongoose.model('Highscore', highscoreSchema)

module.exports = Highscore