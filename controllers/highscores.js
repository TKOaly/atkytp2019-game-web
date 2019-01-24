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

        if (body.user === undefined || body.token === undefined || body.installationId === undefined || body.score === undefined) {
            return response.status(400).json({ error: 'some fields missing' })
        }

        const highscore = new Highscore({
            user: body.user,
            token: body.token,
            installationId: body.installationId,
            score: body.score
        })

        const savedHighscore = await highscore.save()

        response.status(201).json(savedHighscore)
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
    }
})

module.exports = highscoreRouter