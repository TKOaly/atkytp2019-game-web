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

        if (body.name === undefined || body.token === undefined || body.score === undefined) {
            return response.status(400).json({ error: 'name or token missing' })
        }

        const highscore = new Highscore({
            name: body.name,
            token: body.token,
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