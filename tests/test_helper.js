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

const highscoreById = async (id) => {
    const highscore = await Highscore.findById(id)
    return highscore
}

const nonExistingId = async () => {
    const nonExistingData = {
        user: "NonExisting",
        token: "nonexistingtoken",
        score: 0
    }
    const highscore = new Highscore(nonExistingData)
    await highscore.save()
    await highscore.remove()

    return highscore._id.toString()
}

module.exports = {
    initialHighscores, highscoresInDb, highscoreById, nonExistingId
}