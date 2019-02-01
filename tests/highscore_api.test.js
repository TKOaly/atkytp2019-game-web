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
        await api
            .get('/api/highscores')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all highscores are returned as json by GET /api/highscores', async () => {
        const highscoresInDatabase = await highscoresInDb()

        const response = await api
            .get('/api/highscores')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(highscoresInDatabase.length)

        const returnedUsers = response.body.map(highscore => highscore.user)
        highscoresInDatabase.forEach(highscore => {
            expect(returnedUsers).toContain(highscore.user)
        })
    })

    test('highscores contain user, token and score', async () => {
        const response = await api.get('/api/highscores')

        const highscores = response.body

        highscores.forEach(highscore => {
            expect(highscore.user).toBeDefined()
            expect(highscore.token).toBeDefined()
            expect(highscore.score).toBeDefined()
        })
    })
})

describe('addition of a new highscore', async () => {

    test('succeeds with valid data', async () => {
        const highscoresAtStart = await highscoresInDb()

        const newHighscore = {
            user: 'Jone',
            token: '2xxxS'
        }

        await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length + 1)

        const tokens = highscoresAfterOperation.map(highscore => highscore.token)
        expect(tokens).toContain(newHighscore.token)
    })

    test('is initialized with score 0', async () => {
        const newHighscore = {
            user: 'Ocke',
            token: '4xxxW'
        }

        const response = await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(201)

        const created = response.body

        expect(created.score).toBe(0)
    })

    test('fails with proper error message if user is missing', async () => {
        const newHighscore = {
            token: '3xxxT'
        }

        const highscoresAtStart = await highscoresInDb()

        const response = await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const error = response.body.error

        expect(error).toContain('User is required')

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })

    test('fails with proper error message if token is missing', async () => {
        const newHighscore = {
            user: 'Pavi'
        }

        const highscoresAtStart = await highscoresInDb()

        const response = await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const error = response.body.error

        expect(error).toContain('Token is required')

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })

    test('fails with proper error message if user and token is taken', async () => {
        const newHighscore = {
            user: 'Vine',
            token: '5xxxL'
        }

        await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(201)

        const highscoresAtStart = await highscoresInDb()

        const response = await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const error = response.body.error

        expect(error).toContain('Username already taken')
        expect(error).toContain('Token already taken')

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })

})

afterAll(() => {
    server.close()
})