const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Highscore = require('../models/Highscore')
const { initialHighscores, highscoresInDb, highscoreById, nonExistingId } = require('./test_helper')

describe('when there is initially some highscores saved', async () => {

    beforeAll(async () => {
        await Highscore.deleteMany({})

        const highscoreObjects = initialHighscores.map(highscore => new Highscore(highscore))
        await Promise.all(highscoreObjects.map(highscore => highscore.save()))
    })

    test('highscores are returned as json', async () => {
        await getAllAndExpectOk()
    })

    test('all highscores are returned by GET /api/highscores', async () => {
        const highscoresInDatabase = await highscoresInDb()

        const highscores = await getAllAndExpectOk()

        expect(highscores.length).toBe(highscoresInDatabase.length)

        const returnedUsers = highscores.map(highscore => highscore.user)
        highscoresInDatabase.forEach(highscore => {
            expect(returnedUsers).toContain(highscore.user)
        })

    })

    test('highscores are returned as user and score', async () => {
        const highscores = await getAllAndExpectOk()

        highscores.forEach(highscore => {
            isHighscore(highscore)
        })
    })

    test('top 10 highscores are returned by GET /api/highscores/top', async () => {
        const topHighscores = await getTopAndExpectOk()

        const highscoresInDatabase = await highscoresInDb()
        highscoresInDatabase.sort((a, b) => b.score - a.score)

        expect(topHighscores.length).toBe(10)

        expect(topHighscores[0].user).toBe(highscoresInDatabase[0].user)
        expect(topHighscores[0].score).toBe(highscoresInDatabase[0].score)
    })

    test('one highscores is returned by GET /api/highscores/:id', async () => {
        const data = {
            user: 'bestplayer',
            token: 'tokenXXXbest'
        }
        const created = await postAndExpectSuccess(data)

        const newData = {
            score: 10000
        }

        const updated = await putAndExpectSuccess(created._id, newData)

        const highscore = await getOneAndExpectOk(updated._id)

        expect(highscore.user).toBe(data.user)
        expect(highscore.score).toBe(newData.score)
        expect(highscore.rank).toBe(1)
    })

    test('fails with proper error message if nonexisting id GET /api/highscores/:id', async () => {
        const expectedErrors = [
            'Malformatted id'
        ]
        await getOneAndExpectErrors(await nonExistingId(), expectedErrors)
    })
})

describe('addition of a new highscore', async () => {

    beforeAll(async () => {
        await Highscore.deleteMany({})
    })

    test('succeeds with valid data', async () => {
        const newHighscore = {
            user: 'Jone',
            token: '2xxxS'
        }

        await postAndExpectSuccess(newHighscore)
    })

    test('is initialized with score 0', async () => {
        const newHighscore = {
            user: 'Ocke',
            token: '4xxxW'
        }

        const created = await postAndExpectSuccess(newHighscore)

        expect(created.score).toBe(0)
    })

    test('fails with proper error message if user is missing', async () => {
        const newHighscore = {
            token: '3xxxT'
        }

        const expectedErrors = [
            'User is required'
        ]

        await postAndExpectErrors(newHighscore, expectedErrors)
    })

    test('fails with proper error message if token is missing', async () => {
        const newHighscore = {
            user: 'Pavi'
        }

        const expectedErrors = [
            'Token is required'
        ]

        await postAndExpectErrors(newHighscore, expectedErrors)
    })

    test('fails with proper error message if user and token is taken', async () => {
        const newHighscore = {
            user: 'Vine',
            token: '5xxxL'
        }

        await postAndExpectSuccess(newHighscore)

        const expectedErrors = [
            'Username already taken',
            'Token already taken'
        ]

        await postAndExpectErrors(newHighscore, expectedErrors)
    })

})

describe('updating a highscore', async () => {

    beforeAll(async () => {
        await Highscore.deleteMany({})
    })

    test('succeeds with valid data', async () => {
        const newHighscore = {
            user: 'ToBeUpdated',
            token: '2updateS'
        }

        const created = await postAndExpectSuccess(newHighscore)

        const newData = {
            score: 5
        }

        await putAndExpectSuccess(created._id, newData)
    })

    test('fails with proper error message if score is not valid', async () => {
        const newHighscore = {
            user: 'ToBeUpdated2',
            token: '3updateS'
        }

        const created = await postAndExpectSuccess(newHighscore)

        const highscoreAtStart = await highscoreById(created._id)

        const newData = {
        }

        const expectedErrors = [
            'Score must be defined'
        ]

        await putAndExpectErrors(created._id, newData, expectedErrors)

        const newData2 = {
            score: -1
        }

        const expectedErrors2 = [
            'Score must be at least 0'
        ]

        await putAndExpectErrors(created._id, newData2, expectedErrors2)

        const newData3 = {
            score: 'abc'
        }

        const expectedErrors3 = [
            'Score must be an integer'
        ]

        await putAndExpectErrors(created._id, newData3, expectedErrors3)

        const highscoreAfterOperation = await highscoreById(created._id)

        expect(highscoreAfterOperation.score).toBe(highscoreAtStart.score)
    })

    test('fails with proper error message if id not found', async () => {

        const newData = {
            score: 5
        }

        const expectedErrors = [
            'Malformatted id'
        ]

        await putAndExpectErrors(await nonExistingId(), newData, expectedErrors)
    })
})

afterAll(() => {
    server.close()
})

//Helper functions
const postAndExpectSuccess = async (newHighscore) => {
    const highscoresAtStart = await highscoresInDb()
    const response = await api
        .post('/api/highscores')
        .send(newHighscore)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const highscoresAfterOperation = await highscoresInDb()
    expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length + 1)

    const users = highscoresAfterOperation.map(highscore => highscore.user)
    expect(users).toContain(newHighscore.user)

    return response.body
}

const postAndExpectErrors = async (newHighscore, expectedErrors) => {
    const highscoresAtStart = await highscoresInDb()

    const response = await api
        .post('/api/highscores')
        .send(newHighscore)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const error = response.body.error

    expectedErrors.forEach(expectedError => {
        expect(error).toContain(expectedError)
    })

    const highscoresAfterOperation = await highscoresInDb()

    expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
}

const putAndExpectSuccess = async (id, newData) => {
    const response = await api
        .put('/api/highscores/' + id)
        .send(newData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.score).toBe(newData.score)

    return response.body
}

const putAndExpectErrors = async (id, newData, expectedErrors) => {
    const response = await api
        .put('/api/highscores/' + id)
        .send(newData)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const error = response.body.error

    expectedErrors.forEach(expectedError => {
        expect(error).toContain(expectedError)
    })
}

const getAllAndExpectOk = async () => {
    const response = await api
        .get('/api/highscores')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    return response.body
}

const getTopAndExpectOk = async () => {
    const response = await api
        .get('/api/highscores/top')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    return response.body
}

const getOneAndExpectOk = async (id) => {
    const response = await api
        .get('/api/highscores/' + id)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    return response.body
}

const getOneAndExpectErrors = async (id, expectedErrors) => {
    const response = await api
        .get('/api/highscores/' + id)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const error = response.body.error

    expectedErrors.forEach(expectedError => {
        expect(error).toContain(expectedError)
    })
}

const isHighscore = (highscore) => {
    expect(highscore.user).toBeDefined()
    expect(highscore.score).toBeDefined()
    expect(highscore.rank).toBeDefined()
}