const Highscore = require('../models/Highscore')

const initialHighscores = [
    {
        user: "Peter",
        token: "1xxxH",
        installationId: "ab4j338f2485",
        score: 0
    },
    {
        user: "Axel",
        token: "2xxxT",
        installationId: "bfioshf3572ns",
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