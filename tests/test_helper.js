const Highscore = require('../models/Highscore')

const initialHighscores = [
    {
        user: "Peter",
        token: "1xxxH",
        score: 0
    },
    {
        user: "Axel",
        token: "2xxxT",
        score: 0
    }
]

const highscoresInDb = async () => {
    const highscores = await Highscore.find({})
    return highscores
}

module.exports = {
    initialHighscores, highscoresInDb
}