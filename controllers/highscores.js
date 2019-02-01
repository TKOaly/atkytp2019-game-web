const highscoreRouter = require('express').Router()
const Highscore = require('../models/Highscore')

highscoreRouter.get('/', async (request, response) => {
    const highscores = await Highscore
        .find({})

    response.json(highscores)
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
        response.status(500).json({ error: 'something went wrong...' })
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
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })
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
        if (validationError.errors['score']) {
            errorMessages.push(validationError.errors['score'].message)
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