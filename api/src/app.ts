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
import * as msg from './message'

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

//get line credentials
const channelAccessToken = process.env.CAT

//init express app
const app = express()

//use json middleware
app.use(express.json())

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
            /*
            *   Follow event
            *   - add user to friends collection
            *   - send greeting message
            */
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
            /*
            *   Unfollow event
            *   - remove user from friends collection
            *   - remove user from user collection
            */
            else if (body.events[i].type === 'unfollow') {
                const friendDocRef = db.collection('friends').doc(body.events[i].source.userId as string)
                const userDocRef = db.collection('users').doc(body.events[i].source.userId as string)
                fst.dbRemoveOnUnfollow(friendDocRef, userDocRef).catch(err => { console.log(err) })
            }
        }
    }
    console.log('webhook recieved')
    res.status(200).json({})
})
//unfinished
//parcel register path
app.post('/parcelreg', (req: Request, res: Response) => {
    const body = req.body

})

app.post('/userreg', (req: Request, res: Response) => {
    //TODO: remove console.log

    //check for api key
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    let data: any
    try {
        data = req.body
        if (!data.userId || !data.name || !data.surname || !data.phoneNumber || !data.room) {
            throw new Error('Invalid data')
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" })
        console.log('Bad request recieved')
        console.log(err)
        return
    }
    const friendDocRef = db.collection('friends').doc(data.userId)
    fst.checkIfDocumentExist(friendDocRef)
        .then(eligible => {
            if (eligible) {
                const userDocRef = db.collection('users').doc(data.userId)
                fst.checkIfDocumentExist(userDocRef).then(exist => {
                    if (exist) {
                        res.status(409).json({ status: 409, message: "User already exists" })
                        console.log('User already exists')
                    }
                    else {
                        fst.dbSetOnUserRegister(userDocRef, data)
                            .then(() => {
                                console.log('user registered')
                                msg.sendRegistrationConfirmMessage(data.userId as string, channelAccessToken as string, data)
                                    .then(() => {
                                        console.log('user notified about a successful registration')
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                                res.status(200).json({ status: 200, message: "User registered" })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({ status: 500, message: "Internal Server Error" })
                            })
                    }
                })
            }
            else {
                res.status(403).json({ status: 403, message: "Forbidden" })
                console.log('Forbidden request recieved')
            }
        })
})

https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
