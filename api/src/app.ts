import express, { Request, Response } from 'express'
//import axios from 'axios'
import line from '@line/bot-sdk'
import fs from 'fs'
import https from 'https'

//set port
const port = process.env.port || 3000

//https
const privkey = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem")
const cert = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem")
const credentials = { key: privkey, cert: cert }

//init line client from line sdk
const client = new line.Client({
    channelAccessToken: process.env.CAT as string
})

//init express app
const app = express()

//use json middleware
app.use(express.json())

//webhook path
app.get('/test', (req: Request, res: Response) => {
    const userId = req.query.id as string
    const message = {
        type: 'text',
        text: 'Hello World.'
    }
    client.pushMessage(userId, message as any)
        .then(() => {
            res.send(`Sent message to ${userId}`)
        })
        .catch(err => {
            console.log(err)
        })
})

/* app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) */

https.createServer(credentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
