const mongoose = require('mongoose')
const cachegoose = require('cachegoose')
const Highscore = require('../models/Highscore')

cachegoose(mongoose)

const getAll = async (request, response) => {
    const highscores = await Highscore
        .aggregate()
        .sort({ score: -1 })
        .group({
            _id: false,
            highscores: {
                $push: '$$ROOT'
            }
        })
        .unwind({
            path: '$highscores',
            includeArrayIndex: 'highscores.rank'
        })
        .replaceRoot('highscores')
        .addFields({
            rank: {
                $add: ['$rank', 1]
            }
        })
        .project({
            _id: false,
            token: false,
            __v: false
        })
        .cache(0, 'all_highscores')
        .exec()

    response.json(highscores)
}

const getTop10 = async (request, response) => {
    const highscores = await Highscore
        .aggregate()
        .sort({ score: -1 })
        .limit(10)
        .group({
            _id: false,
            highscores: {
                $push: '$$ROOT'
            }
        })
        .unwind({
            path: '$highscores',
            includeArrayIndex: 'highscores.rank'
        })
        .replaceRoot('highscores')
        .addFields({
            rank: {
                $add: ['$rank', 1]
            }
        })
        .project({
            _id: false,
            token: false,
            __v: false
        })
        .cache(0, 'top_10_highscores')
        .exec()

    response.json(highscores)
}

const getOne = async (request, response) => {
    const id = request.params.id

    const highscores = await Highscore
        .aggregate()
        .sort({ score: -1 })
        .group({
            _id: false,
            highscores: {
                $push: '$$ROOT'
            }
        })
        .unwind({
            path: '$highscores',
            includeArrayIndex: 'highscores.rank'
        })
        .replaceRoot('highscores')
        .match({
            _id: mongoose.Types.ObjectId(id)
        })
        .addFields({
            rank: {
                $add: ['$rank', 1]
            }
        })
        .project({
            _id: false,
            token: false,
            __v: false
        })
        .cache(0, `${id}-highscore`)
        .exec()

    if (highscores.length !== 0) {
        response.json(highscores[0])
    } else {
        response.status(400).send({ error: ['Malformatted id'] })
    }
}

const create = async (request, response) => {
    try {
        const body = request.body

        const newHighscore = new Highscore({
            user: body.user,
            token: body.token,
            score: 0
        })

        const errorMessages = await validate(newHighscore)

        if (errorMessages.length > 0) {
            return response.status(400).json({ error: errorMessages })
        }

        const savedHighscore = await newHighscore.save()

        const highscores = await Highscore
            .aggregate()
            .sort({ score: -1 })
            .group({
                _id: false,
                highscores: {
                    $push: '$$ROOT'
                }
            })
            .unwind({
                path: '$highscores',
                includeArrayIndex: 'highscores.rank'
            })
            .replaceRoot('highscores')
            .match({
                _id: mongoose.Types.ObjectId(savedHighscore._id)
            })
            .addFields({
                rank: {
                    $add: ['$rank', 1]
                }
            })
            .project({
                __v: false
            })
            .exec()

        cachegoose.clearCache()
        response.status(201).json(highscores[0])
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: ['something went wrong...'] })
    }
}

const update = async (request, response) => {
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

        const highscores = await Highscore
            .aggregate()
            .sort({ score: -1 })
            .group({
                _id: false,
                highscores: {
                    $push: '$$ROOT'
                }
            })
            .unwind({
                path: '$highscores',
                includeArrayIndex: 'highscores.rank'
            })
            .replaceRoot('highscores')
            .match({
                _id: mongoose.Types.ObjectId(updatedHighscore._id)
            })
            .addFields({
                rank: {
                    $add: ['$rank', 1]
                }
            })
            .project({
                __v: false
            })
            .exec()

        cachegoose.clearCache()
        response.json(highscores[0])
    } catch (exception) {
        response.status(400).send({ error: ['Malformatted id'] })
    }
}

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

module.exports = {
    getAll,
    getTop10,
    getOne,
    create,
    update
}