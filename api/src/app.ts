import express, { Request, Response } from 'express'
//import line from '@line/bot-sdk'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue, DocumentReference } from 'firebase-admin/firestore'
import fs from 'fs'
import https from 'https'
import axios from 'axios'
import cors from 'cors'
import bearerToken from 'express-bearer-token'
import { sendGreetingMessage } from './greetings'
import * as fst from './firestoreoperation'

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

//use bearer token middleware
app.use(bearerToken())

//define cors option //TODO: change to allow origin
const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

//use cors middleware
app.use(cors(corsOption))


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
                        fst.dbSetOnFollow(docRef, { userId: data.data.userId, displayName: data.data.displayName, picLink: data.data.pictureUrl }).catch(err => { console.log(err) })
                    })
            }
            else if (body.events[i].type === 'unfollow') {
                const docRef = db.collection('friends').doc(body.events[i].source.userId as string)
                fst.dbRemoveOnUnfollow(docRef)
            }
        }
    }
    console.log('webhook recieved')
    res.json({}).status(200)
})
//unfinished
//parcel register path
app.post('/parcelreg', (req: Request, res: Response) => {
    const body = req.body

})

app.post('/userreg', (req: Request, res: Response) => {

    //check for api key
    if (req.token !== process.env.API_KEY) {
        res.json({ status: 401, message: "Unauthorized" }).status(401)
        console.log('Unauthorized request recieved')
        console.log(req.token)
        console.log(process.env.API_KEY)
        return
    }
    const data = req.body
    const friendDocRef = db.collection('friends').doc(data.userId)
    fst.checkIfUserIsEligible(friendDocRef, data.userId)
        .then(eligible => {
            if (eligible) {
                const userDocRef = db.collection('users').doc(data.userId)
                fst.dbSetOnUserRegister(userDocRef, data)
                    .then(() => {
                        console.log('user registered')
                    })
                    .catch(err => {
                        console.log(err)
                        res.json({ status: 500, message: "Internal Server Error" }).status(500)
                    })
            }
            else {
                res.json({ status: 403, message: "Forbidden" }).status(403)
                console.log('Forbidden request recieved')
            }
        })
})

https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
