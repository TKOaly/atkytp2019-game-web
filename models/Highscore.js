const mongoose = require('mongoose')

const highscoreSchema = new mongoose.Schema({
    user: {
        type: String,
        unique: [true, 'User must be unique'],
        required: [true, 'User is required'],
        dropDups: true
    },
    token: {
        type: String,
        unique: [true, 'Token must be unique'],
        required: [true, 'Token is required'],
        dropDups: true
    },
    installationId: {
        type: String,
        unique: [true, 'InstallationId must be unique'],
        required: [true, 'InstallationId is required'],
        dropDups: true
    },
    score: {
        type: Number,
        min: [0, 'Score must be at least 0'],
        required: [true, 'Score is required']
    }
})

const Highscore = mongoose.model('Highscore', highscoreSchema)

module.exports = Highscore