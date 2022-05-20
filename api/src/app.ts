import express, { Request, Response } from 'express'
//import axios from 'axios'
import line from '@line/bot-sdk'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue, DocumentReference } from 'firebase-admin/firestore'
import fs from 'fs'
import https from 'https'
import axios from 'axios'
import { sendGreetingMessage } from './greetings'

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

const dbSetOnUnfollow = async (ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>) => {
    await ref.delete()
}

//https
const sslPrivkey = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem")
const sslCertificate = fs.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem")
const sslCredentials = { key: sslPrivkey, cert: sslCertificate }

/* //init line client from line sdk
const lineClient = new line.Client({
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
                axios.get(`https://api.line.me/v2/bot/profile/${body.events[i].source.userId}`, {
                    headers: {
                        Authorization: `Bearer ${channelAccessToken}`
                    }
                })
                    .then(data => {
                        sendGreetingMessage(body.events[i].source.userId, channelAccessToken as string, data.data.displayName).catch(err => { console.log(err) })
                        const docRef = db.collection('friends').doc(body.events[i].source.userId as string)
                        dbSetOnFollow(docRef, data.data.userId, data.data.displayName, data.data.pictureUrl).catch(err => { console.log(err) })
                    })
            }
            else if (body.events[i].type === 'unfollow') {
                const docRef = db.collection('friends').doc(body.events[i].source.userId as string)
                dbSetOnUnfollow(docRef)
            }
        }
    }
    console.log('webhook recieved')
    res.json({}).status(200)
})

https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
