import express, { Request, Response } from 'express'
//import axios from 'axios'
import line from '@line/bot-sdk'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue, DocumentReference } from 'firebase-admin/firestore'
import fs from 'fs'
import https from 'https'
import axios from 'axios'

//set port
const port = process.env.port || 3000

//get credentials path
const firebaseCredPath = process.env.cred as string

//init firestore
const serviceAccount = require(firebaseCredPath)
initializeApp({
    credential: cert(serviceAccount)
})
const db = getFirestore()

//async functions for database operation
const dbSetOnFollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, userId: string, displayName: string, picLink: string) => {
    await ref.set({
        userId: userId,
        displayName: displayName,
        piclink: picLink
    })
}

//https
const sslPrivkey = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem")
const sslCertificate = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem")
const sslCredentials = { key: sslPrivkey, cert: sslCertificate }

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
app.post('/webhook', (req: Request, res: Response) => {
    const body = req.body
    if (body.events) {
        for (let i = 0; i < body.events.length; i++) {
            if (body.events[i].type === 'follow') {
                console.log(body.events[i].source.userId)
                axios.get(`https://api.line.me/v2/bot/profile/${body.events[i].source.userId}`)
                    .then(data => {
                        const docRef = db.collection('friends').doc(body.events[i].source.userId as string)
                        dbSetOnFollow(docRef, data.data.userId, data.data.displayName, data.data.pictureUrl)
                    })
            }
            else if (body.events[i].type === 'unfollow') {

            }
        }
    }
    console.log('webhook recieved')
    res.json({}).status(200)
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

https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
