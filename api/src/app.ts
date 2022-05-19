import express, { Request, Response } from 'express'
//import axios from 'axios'
//import line from '@line/bot-sdk'
import fs from 'fs'
import https from 'https'
import axios from 'axios'

//set port
const port = process.env.port || 3000

//https
const privkey = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem")
const cert = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem")
const credentials = { key: privkey, cert: cert }

/* //init line client from line sdk
const client = new line.Client({
    channelAccessToken: process.env.CAT as string
}) */

const channelAccessToken = process.env.CAT

//init express app
const app = express()

//use json middleware
app.use(express.json())

//webhook path
app.post('/callback', (req: Request, res: Response) => {
    const body = req.body
    if (!body) {
        res.send('Bad Request').status(400)
        return
    }
    if (body.events) {
        for (let i = 0; i < body.events.length; i++) {
            if (body.events[i].type === 'follow') {
                console.log(body.events[i].source.userId)
            }
        }
    }
    res.status(200)
})

//test path
app.get('/test', (req: Request, res: Response) => {
    const userId = req.query.id as string
    const message = {
        to: userId,
        messages: [
            {
                type: 'text',
                text: 'Hello World.'
            }
        ]
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`

    }
    axios.post('https://api.line.me/v2/bot/message/push', message, headers as any)
        .then(() => {
            res.send(`Sent message to ${userId}`)
        })
        .catch(err => {
            console.log(err)
        })
    /* client.pushMessage(userId, message as any)
        .then(() => {
            res.send(`Sent message to ${userId}`)
        })
        .catch(err => {
            console.log(err)
        }) */
})

/* app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) */

https.createServer(credentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
