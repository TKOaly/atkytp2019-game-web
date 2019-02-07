const Highscore = require('../models/Highscore')

const initialHighscores = [
    {
        user: "Peter",
        token: "1xxxH",
        score: 2
    },
    {
        user: "Axel",
        token: "2xxxT",
        score: 0
    },
    {
        user: "Jone",
        token: "3xxxT",
        score: 5
    },
    {
        user: "Pavi",
        token: "4xxxT",
        score: 0
    },
    {
        user: "Ocke",
        token: "5xxxT",
        score: 10
    },
    {
        user: "Pelle",
        token: "6xxxT",
        score: 9
    },
    {
        user: "Johan",
        token: "7xxxT",
        score: 0
    },
    {
        user: "Mia",
        token: "8xxxT",
        score: 2
    },
    {
        user: "Markus",
        token: "9xxxT",
        score: 0
    },
    {
        user: "Markko",
        token: "2xxxS",
        score: 2
    },
    {
        user: "Jaakko",
        token: "3xxxS",
        score: 1
    },
    {
        user: "Jesper",
        token: "4xxxS",
        score: 4
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