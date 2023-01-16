require('dotenv').config()

const cors = require('cors')
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder');
const bodyParser = require('body-parser')

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refresh_token
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken
    })
    
    spotifyApi.refreshAccessToken()
    .then((data) => {
        res.json({
            accessToken: data.access_token,
            expiresIn: data.body.expires_in
        })
    }).catch(() => {
        res.sendStatus(400)
    })
})

app.post('/login', (req, res) => {
    const code = req.body.code

    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    })
    
    spotifyApi
    .authorizationCodeGrant(`${code}`)
    .then((data) => {

        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(400)
    })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artis, req.query.track || 'No Lyrics Found')
    res.json({ lyrics })
})

app.listen(8080,() => {
    console.log('listening on port 8080');
} )
