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
            installationId: body.installationId,
            score: body.score
        })

        const validationError = highscore.validateSync()
        const users = await Highscore.countDocuments({ user: highscore.user })
        const tokens = await Highscore.countDocuments({ token: highscore.token })
        const installationIds = await Highscore.countDocuments({ installationId: highscore.installationId })

        if (validationError || users || tokens || installationIds) {
            const errorMessages = []
            if (users) errorMessages.push('Username already taken')
            if (tokens) errorMessages.push('Token already taken')
            if (installationIds) errorMessages.push('InstallationId already taken')

            if (validationError) {
                if (validationError.errors['user']) {
                    errorMessages.push(validationError.errors['user'].message)
                }
                if (validationError.errors['token']) {
                    errorMessages.push(validationError.errors['token'].message)
                }
                if (validationError.errors['installationId']) {
                    errorMessages.push(validationError.errors['installationId'].message)
                }
                if (validationError.errors['score']) {
                    errorMessages.push(validationError.errors['score'].message)
                }
            }
            return response.status(400).json({ error: errorMessages })
        }

        const savedHighscore = await highscore.save()

        response.status(201).json(savedHighscore)
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
    }
})

module.exports = highscoreRouter