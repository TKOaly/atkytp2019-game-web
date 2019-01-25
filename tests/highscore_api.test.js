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
})

describe('addition of a new highscore', async () => {

    test('POST /api/highscore succeeds with valid data', async () => {
        const highscoresAtStart = await highscoresInDb()

        const newHighscore = {
            user: "Jone",
            token: "2xxxS",
            installationId: "ab4jkduv24sd5",
            score: 0
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

    test('POST /api/highscore fails with proper statuscode if user is missing', async () => {
        const newHighscore = {
            token: "3xxxT",
            installationId: "jkdgdfv76sd5",
            score: 0
        }

        const highscoresAtStart = await highscoresInDb()

        await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })

    test('POST /api/highscore fails with proper statuscode if token is missing', async () => {
        const newHighscore = {
            user: "Pavi",
            installationId: "jkdgdnhgsd5",
            score: 0
        }

        const highscoresAtStart = await highscoresInDb()

        await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })

    test('POST /api/highscore fails with proper statuscode if installationId is missing', async () => {
        const newHighscore = {
            user: "Pavi",
            token: "Hxcv2",
            score: 0
        }

        const highscoresAtStart = await highscoresInDb()

        await api
            .post('/api/highscores')
            .send(newHighscore)
            .expect(400)

        const highscoresAfterOperation = await highscoresInDb()

        expect(highscoresAfterOperation.length).toBe(highscoresAtStart.length)
    })
})

afterAll(() => {
    server.close()
})