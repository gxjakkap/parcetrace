import express, { NextFunction, Request, Response } from 'express'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { v4 as uuidv4 } from 'uuid';
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

const API_KEY = process.env.API_KEY

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

//error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({ status: 500, message: "An error occured!" })
})

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
                axios.get(`https://api.line.me/v2/bot/profile/${body.events[i].source.userId}`, {
                    headers: {  
                        Authorization: `Bearer ${channelAccessToken}`
                    }
                })
                    .then(data => {
                        msg.sendGreetingMessage(body.events[i].source.userId, channelAccessToken as string, data.data.displayName).catch(err => { console.log(err) })
                        const docRef = db.collection('users').doc(body.events[i].source.userId as string)
                        fst.dbSetOnFollow(docRef, { userId: data.data.userId, lineData: {displayName: data.data.displayName, picLink: data.data.pictureUrl}, isRegistered: false }).catch(err => { console.log(err) })
                    })
            }
            /*
            *   Unfollow event
            *   - remove user from friends collection
            *   - remove user from user collection
            */
            else if (body.events[i].type === 'unfollow') {
                const userDocRef = db.collection('users').doc(body.events[i].source.userId as string)
                fst.dbRemoveOnUnfollow(userDocRef).catch(err => { console.log(err) })
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
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ error: 'unauthorized' })
        return
    }
    let body: any
    try {
        body = req.body
        if (!body.sender || !body.location || !body.userId) throw Error('value missing')
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ status: 400, message: 'bad request' })
    }
    console.log(body)
    let randomUUID = crypto.randomUUID();
    const date = new Date
    const dataForUser: fst.userParcel = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: randomUUID, location: body.location }
    const dataForAllActive: fst.allParcel = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: randomUUID, userId: body.userId, location: body.location }
    const userRef = db.collection('users').doc(body.userId as string)
    const allActiveRef = db.collection('allActiveParcel').doc(randomUUID as string)
    fst.dbSetOnParcelRegister(userRef, dataForUser, allActiveRef, dataForAllActive)
        .then(() => {
            msg.sendParcelNotificationMessageNew(body.userId, channelAccessToken as string, dataForUser)
            res.status(200).json({ status: 200, message: 'Parcel registered' })
        })
        .catch(err => { console.log(err); res.status(500).json({ status: 500, message: 'Internal Server Error' }); return })
})

app.post('/userreg', (req: Request, res: Response) => {
    //TODO: remove console.log

    //check for api key
    if (req.headers.authorization !== API_KEY) {
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
    const docRef = db.collection('users').doc(data.userId)
    fst.checkForRegistrationEligibility(docRef)
        .then(eligible => {
            if (eligible){
                fst.dbSetOnUserRegister(docRef, data)
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
            else {
                res.status(403).json({ status: 403, message: "Forbidden. Either user isn't a friend yet or user is already registered." }) 
            }
        })
})

//get user id
app.get('/getUserId', (req: Request, res: Response) => {
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    if (!req.query.phoneNo) {
        res.status(400).json({ status: 400, message: 'bad request' })
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
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    if (!req.query.userId) {
        res.status(400).json({ status: 400, message: 'bad request' })
        return
    }
    const userId = req.query.userId as string
    const docRef = db.collection('users').doc(userId)
    fst.getUserActiveParcels(docRef)
        .then(data => {
            /* if (activeParcels.length > 0) {
                console.log('active parcels found')
                res.status(200).json({ status: 200, parcels: activeParcels })
            }
            else {
                console.log('no active parcels found')
                res.status(200).json({ status: 200, parcels: [] })
            } */
            if (data || (data !== undefined || data !== null)){
                if (data?.activeParcel.length > 0){
                    res.status(200).json({ status: 200, parcels: data?.activeParcel, userData: data?.userData, lineData: data?.lineData })
                }
                else {
                    res.status(200).json({ status: 200, parcels: [], userData: data?.userData, lineData: data?.lineData })
                }
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
})

app.get('/allparcellist', (req: Request, res: Response) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    const colRef = db.collection('allActiveParcel')
    fst.getAllParcel(colRef)
        .then((data) => {
            if (data || (data !== undefined || data !== null)){
                if (data?.length > 0){
                    res.status(200).json({ status: 200, data: data })
                }
                else {
                    res.status(404).json({ status: 404, data: [] })
                }
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
    /* fst.getUserActiveParcels(docRef)
        .then(data => {
            if (data || (data !== undefined || data !== null)){
                if (data?.activeParcel.length > 0){
                    res.status(200).json({ status: 200, parcels: data?.activeParcel, userData: data?.userData, lineData: data?.lineData })
                }
                else {
                    res.status(200).json({ status: 200, parcels: [], userData: data?.userData, lineData: data?.lineData })
                }
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        }) */
    
})

app.get('/getparceldata', (req: Request, res: Response) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }
    if (!req.query.parcelId) {
        res.status(400).json({ status: 400, message: 'bad request' })
        return
    }
    const parcelId = req.query.parcelId as string
    const docRef = db.collection('allActiveParcel').doc(parcelId)
    fst.getParcelDataFromAllParcel(docRef)
        .then(data => {
            if (!data) {
                res.status(404).json({ status: 404, message: "Parcel not found" })
                return
            }
            console.log('parcel data found')
            res.status(200).json({ status: 200, data: data })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ status: 500, message: "Internal Server Error" })
        })
})

//parcel delete method
app.post('/parcelrem', (req: Request, res: Response) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" })
        console.log('Unauthorized request recieved')
        return
    }

    //check for data
    let data: any
    try {
        data = req.body
        if (!data.parcelId) {
            throw new Error('Invalid data')
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" })
        console.log('Bad request recieved')
        console.log(err)
        return
    }

    const docRef = db.collection('allActiveParcel').doc(data.parcelId)
    fst.getParcelDataFromAllParcel(docRef)
        .then(pData => {
            if (!pData) {
                res.status(404).json({ status: 404, message: "Parcel not found" })
                return
            }
            console.log('parcel data found')
            const userId = pData.userId
            const userDocRef = db.collection('users').doc(userId)
            fst.getUserActiveParcels(userDocRef)
                .then(returnedData => {
                    if (returnedData?.activeParcel.length > 0) {
                        fst.dbRemoveDoc(db.collection('allActiveParcel').doc(data.parcelId))
                        fst.dbRemoveParcelFromUserData(userDocRef, data.parcelId)
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
})

/**  registering mobile device for the first time, the flow is
 *      - recieve master password provided by client
 *      - retrieve the salt from the database
 *      - hash client provided password and compare it to the hash stored in the database
 *      - if it matches, then the server will generate a new session id and store it on the database
 *      - it will then response with sessionid generated * 
 */
app.post('/adminapp/authen', (req: Request, res: Response) => {
    let data: any
    try {
        data = req.body
        if (!data.password) {
            throw new Error('Invalid data')
        }

    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" })
        console.log('Bad request recieved')
        console.log(err)
        return
    }


    const docRef = db.collection('credentials').doc('mobilemasterkey')
    docRef.get().then(doc => {
        const docdata = doc.data()
        const hash = crypto.createHash('sha256').update(data.password+docdata?.salt).digest('hex')
        if (hash==docdata?.hash){
            const newuuid = uuidv4()
            const ssref = db.collection('activeMobileSession')
            const newsession = {
                id: newuuid,
                dateAdded: Date.now()
            }
            ssref.add(newsession).then(nref => {
                if (nref){
                    res.status(200).json({status: 200, sessionid: newuuid})
                }
                else {
                    res.status(500).json({status: 500, message: "Internal Server Error"})
                }
            })
        }
        else {
            res.status(401).json({status: 401, message: "Wrong Password!"})
        }
    })
})

/**
 * Remove session aka. logout.
 * remove that session from the database. 
 */
 app.post('/adminapp/logout', (req: Request, res: Response) => {
    let data: any
    try {
        data = req.body
        if (!data.sessionid) {
            throw new Error('Invalid data')
        }

    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" })
        console.log('Bad request recieved')
        console.log(err)
        return
    }


    const docRef = db.collection('activeMobileSession')

    docRef.where('id', '==', data.sessionid).get()
        .then(snapshot => {
            if (snapshot.empty){
                res.status(404).json({message: "Session doesn't exist"})
                return
            }

            if (snapshot.size > 1){
                res.status(500).json({ message: "Internal Server Error"})
                return
            }

            db.collection('activeMobileSession').doc(snapshot.docs[0].id).delete()
                .then(x => {
                    res.status(200).json({message: "Success"})
                })
                .catch(err => {
                    res.status(500).json({ message: "Internal Server Error"})
                })

        })
   
})


https.createServer(sslCredentials, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`)
})