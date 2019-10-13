const highscoreRouter = require('express').Router()
const highscoreController = require('../controllers/highscoreController')

const authMiddleware = (req, res, next) => {
    if(req.get('X-Authorization-Token') === undefined) {
        return res.status(400).send('Unauthorized')
    }
    if(req.get('X-Authorization-Token') !== process.env.AUTH_TOKEN || '') {
        return res.status(400).send('Unauthorized')
    }
    next()
}

highscoreRouter.use(authMiddleware)

highscoreRouter.get('/', highscoreController.getAll)

highscoreRouter.get('/top', highscoreController.getTop10)

highscoreRouter.get('/:id', highscoreController.getOne)

highscoreRouter.post('/', highscoreController.create)

highscoreRouter.put('/:id', highscoreController.update)

module.exports = highscoreRouter