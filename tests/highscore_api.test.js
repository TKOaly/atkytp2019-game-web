const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Highscore = require('../models/Highscore')
const { initialHighscores, highscoresInDb } = require('./test_helper')

describe('when there is initially some notes saved', async () => {

    beforeAll(async () => {
        await Highscore.remove({})

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

    test('highscores contain user, token and score', async () => {
        const highscores = await getAllAndExpectOk()

        highscores.forEach(highscore => {
            isHighscore(highscore)
        })
    })
})

describe('addition of a new highscore', async () => {

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
    
    test('succeeds with valid data', async () => {
        const newHighscore = {
            user: 'ToBeUpdated',
            token: '2updateS'
        }

        const created = await postAndExpectSuccess(newHighscore)

        const newData = {
            score: 5
        }

        const updated = await putAndExpectSuccess(created._id, newData)

        expect(updated.score).toBe(5)
    })

    //TODO more tests for PUT
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

    return response.body
}

const getAllAndExpectOk = async () => {
    const response = await api
        .get('/api/highscores')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    return response.body
}

const isHighscore = (highscore) => {
    expect(highscore.user).toBeDefined()
    expect(highscore.token).toBeDefined()
    expect(highscore.score).toBeDefined()
}