const highscoreRouter = require('express').Router()
const highscoreController = require('../controllers/highscoreController')

highscoreRouter.get('/', highscoreController.getAll)

highscoreRouter.get('/top', highscoreController.getTop10)

highscoreRouter.get('/:id', highscoreController.getOne)

highscoreRouter.post('/', highscoreController.create)

highscoreRouter.put('/:id', highscoreController.update)

module.exports = highscoreRouter