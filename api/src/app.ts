import express, { Request, Response } from 'express'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import fs from 'fs'
import https from 'https'
import axios from 'axios'
import cors from 'cors'
import crypto from 'crypto'
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
                        msg.sendGreetingMessage(body.events[i].source.userId, channelAccessToken as string, data.data.displayName).catch(err => { console.log(err) })
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
    //check for api key
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ error: 'unauthorized' })
        return
    }
    let body: any
    try {
        body = req.body
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ status: 400, message: 'bad request' })
    }
    console.log(body)
    let randomUUID = crypto.randomUUID();
    const date = new Date
    const dataForUser: fst.userParcel = { status: 'available', date: date, sender: body.sender, parcelId: crypto.randomUUID(), location: body.location }
    const dataForAllActive: fst.allParcel = { status: 'available', date: date, sender: body.sender, parcelId: crypto.randomUUID(), userId: body.userId, location: body.location }
    const userRef = db.collection('users').doc(body.userId as string)
    const allActiveRef = db.collection('allActiveParcel').doc(randomUUID as string)
    fst.dbSetOnParcelRegister(userRef, dataForUser, allActiveRef, dataForAllActive)
        .then(() => {
            msg.sendParcelNotificationMessage(body.userId, channelAccessToken as string, dataForUser)
            res.status(200).json({ status: 200, message: 'Parcel registered' })
        })
        .catch(err => { console.log(err); res.status(500).json({ status: 500, message: 'Internal Server Error' }); return })
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

//get user id
app.get('/getUserId', (req: Request, res: Response) => {
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    const phoneNumber = req.query.phoneNo as string
    const collectionRef = db.collection('users')
    fst.findUserWithPhoneNumber(collectionRef, phoneNumber)
        .then(response => {
            if (response.successful) {
                if (response.statusCode === 200) {
                    res.status(200).json({ status: 200, userId: response.userId })
                }
                else {
                    res.status(500).json({ status: 500, message: "Internal Server Error" })
                }
            }
            else {
                res.status(response.statusCode).json({ status: response.statusCode, message: response.errorMessage })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
})

app.get('/parcelcheck', (req: Request, res: Response) => {
    //check for api key
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    const userId = req.query.userId as string
    const docRef = db.collection('users').doc(userId)
    fst.getUserActiveParcels(docRef)
        .then(activeParcels => {
            if (activeParcels.length > 0) {
                console.log('active parcels found')
                res.status(200).json({ status: 200, parcels: activeParcels })
            }
            else {
                console.log('no active parcels found')
                res.status(200).json({ status: 200, parcels: [] })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
})

//parcel delete method
app.delete('/parcelrem', (req: Request, res: Response) => {
    //check for api key
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }

    //check for data
    let data: any
    try {
        data = req.body
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" })
        console.log('Bad request recieved')
        console.log(err)
        return
    }

    //get user data reference
    const docRef = db.collection('users').doc(data.userId)

    //get user active parcels reference
    fst.getUserActiveParcels(docRef)
        .then(activeParcels => {
            if (activeParcels.length > 0) {
                fst.dbRemoveDoc(db.collection('allActiveParcel').doc(data.parcelId))
                fst.dbRemoveParcelFromUserData(docRef, data.parcelId)
                res.status(200).json({ status: 200, message: "Parcel deleted" })
            }
            else {
                console.log('no active parcels found')
                res.status(404).json({ status: 404, message: "No active parcels found" })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
})

https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
