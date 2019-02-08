const highscoreRouter = require('express').Router()
const Highscore = require('../models/Highscore')

highscoreRouter.get('/', async (request, response) => {
    const highscores = await Highscore
        .find({})

    response.json(highscores.map((highscore) => Highscore.format(highscore, -1)))
})

highscoreRouter.get('/top', async (request, response) => {
    const topHighscores = await Highscore
        .find({})
        .sort({ score: -1 })
        .limit(10)
        .exec()

    response.json(topHighscores.map((highscore, i) => Highscore.format(highscore, i + 1)))
})

highscoreRouter.get('/:id', async (request, response) => {
    try {
        const id = request.params.id
        const highscore = await Highscore
            .findById(id)

        const topHighscores = await Highscore
            .find({})
            .sort({ score: -1 })
            .exec()

        const rank = topHighscores.findIndex(h => String(h._id) === id) + 1

        const highscoreWithRank = Highscore.format(highscore)
        highscoreWithRank.rank = rank

        response.json(highscoreWithRank)
    } catch (exception) {
        response.status(400).send({ error: ['Malformatted id'] })
    }
})

highscoreRouter.post('/', async (request, response) => {
    try {
        const body = request.body

        const highscore = new Highscore({
            user: body.user,
            token: body.token,
            score: 0
        })

        const errorMessages = await validate(highscore)

        if (errorMessages.length > 0) {
            return response.status(400).json({ error: errorMessages })
        }

        const savedHighscore = await highscore.save()

        response.status(201).json(savedHighscore)
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: ['something went wrong...'] })
    }
})

highscoreRouter.put('/:id', async (request, response) => {
    try {
        const body = request.body
        const id = request.params.id

        const newData = {
            score: body.score
        }

        const errorMessages = await validateScore(newData.score)

        if (errorMessages.length > 0) {
            return response.status(400).json({ error: errorMessages })
        }

        const updatedHighscore = await Highscore.findByIdAndUpdate(id, newData, { new: true })

        response.json(updatedHighscore)
    } catch (exception) {
        response.status(400).send({ error: ['Malformatted id'] })
    }
})

const validate = async (highscore) => {
    const errorMessages = []

    const validationError = highscore.validateSync()
    const usernameTaken = await Highscore.findOne({ user: highscore.user })
    const tokenTaken = await Highscore.findOne({ token: highscore.token })

    if (usernameTaken) errorMessages.push('Username already taken')
    if (tokenTaken) errorMessages.push('Token already taken')
    if (validationError) {
        if (validationError.errors['user']) {
            errorMessages.push(validationError.errors['user'].message)
        }
        if (validationError.errors['token']) {
            errorMessages.push(validationError.errors['token'].message)
        }
    }

    return errorMessages
}

const validateScore = (score) => {
    const errorMessages = []

    if (score === undefined) {
        errorMessages.push('Score must be defined')
    }

    if (!Number.isInteger(score)) {
        errorMessages.push('Score must be an integer')
    }

    if (score < 0) {
        errorMessages.push('Score must be at least 0')
    }

    return errorMessages
}

module.exports = highscoreRouter