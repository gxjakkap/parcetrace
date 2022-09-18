"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const crypto_1 = __importDefault(require("crypto"));
const fst = __importStar(require("./firestoreoperation"));
const msg = __importStar(require("./message"));
//set port
const port = process.env.port || 3000;
//get credentials path
const firebaseCredPath = process.env.cred;
//init firestore
const serviceAccount = require(firebaseCredPath);
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount)
});
const db = (0, firestore_1.getFirestore)();
//https
const sslPrivkey = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem");
const sslCertificate = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem");
const sslCredentials = { key: sslPrivkey, cert: sslCertificate };
//get line credentials
const channelAccessToken = process.env.CAT;
const API_KEY = process.env.API_KEY;
//init express app
const app = (0, express_1.default)();
//use json middleware
app.use(express_1.default.json());
//define cors option //TODO: change to allow origin
const corsOption = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
//use cors middleware
app.use((0, cors_1.default)(corsOption));
//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 500, message: "An error occured!" });
});
//webhook path
app.post('/webhook', (req, res) => {
    const body = req.body;
    if (body.events) {
        for (let i = 0; i < body.events.length; i++) {
            /*
            *   Follow event
            *   - add user to friends collection
            *   - send greeting message
            */
            if (body.events[i].type === 'follow') {
                axios_1.default.get(`https://api.line.me/v2/bot/profile/${body.events[i].source.userId}`, {
                    headers: {
                        Authorization: `Bearer ${channelAccessToken}`
                    }
                })
                    .then(data => {
                    msg.sendGreetingMessage(body.events[i].source.userId, channelAccessToken, data.data.displayName).catch(err => { console.log(err); });
                    const docRef = db.collection('users').doc(body.events[i].source.userId);
                    fst.dbSetOnFollow(docRef, { userId: data.data.userId, lineData: { displayName: data.data.displayName, picLink: data.data.pictureUrl }, isRegistered: false }).catch(err => { console.log(err); });
                });
            }
            /*
            *   Unfollow event
            *   - remove user from friends collection
            *   - remove user from user collection
            */
            else if (body.events[i].type === 'unfollow') {
                const userDocRef = db.collection('users').doc(body.events[i].source.userId);
                fst.dbRemoveOnUnfollow(userDocRef).catch(err => { console.log(err); });
            }
        }
    }
    console.log('webhook recieved');
    res.status(200).json({});
});
//unfinished
//parcel register path
app.post('/parcelreg', (req, res) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ error: 'unauthorized' });
        return;
    }
    let body;
    try {
        body = req.body;
        if (!body.sender || !body.location || !body.userId)
            throw Error('value missing');
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 400, message: 'bad request' });
    }
    console.log(body);
    let randomUUID = crypto_1.default.randomUUID();
    const date = new Date;
    const dataForUser = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: randomUUID, location: body.location };
    const dataForAllActive = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: randomUUID, userId: body.userId, location: body.location };
    const userRef = db.collection('users').doc(body.userId);
    const allActiveRef = db.collection('allActiveParcel').doc(randomUUID);
    fst.dbSetOnParcelRegister(userRef, dataForUser, allActiveRef, dataForAllActive)
        .then(() => {
        msg.sendParcelNotificationMessageNew(body.userId, channelAccessToken, dataForUser);
        res.status(200).json({ status: 200, message: 'Parcel registered' });
    })
        .catch(err => { console.log(err); res.status(500).json({ status: 500, message: 'Internal Server Error' }); return; });
});
app.post('/userreg', (req, res) => {
    //TODO: remove console.log
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    let data;
    try {
        data = req.body;
        if (!data.userId || !data.name || !data.surname || !data.phoneNumber || !data.room) {
            throw new Error('Invalid data');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const docRef = db.collection('users').doc(data.userId);
    fst.checkForRegistrationEligibility(docRef)
        .then(eligible => {
        if (eligible) {
            fst.dbSetOnUserRegister(docRef, data)
                .then(() => {
                console.log('user registered');
                msg.sendRegistrationConfirmMessage(data.userId, channelAccessToken, data)
                    .then(() => {
                    console.log('user notified about a successful registration');
                })
                    .catch(err => {
                    console.log(err);
                });
                res.status(200).json({ status: 200, message: "User registered" });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({ status: 500, message: "Internal Server Error" });
            });
        }
        else {
            res.status(403).json({ status: 403, message: "Forbidden. Either user isn't a friend yet or user is already registered." });
        }
    });
});
//get user id
app.get('/getUserId', (req, res) => {
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    if (!req.query.phoneNo) {
        res.status(400).json({ status: 400, message: 'bad request' });
        return;
    }
    const phoneNumber = req.query.phoneNo;
    const collectionRef = db.collection('users');
    fst.findUserWithPhoneNumber(collectionRef, phoneNumber)
        .then(response => {
        if (response.successful) {
            if (response.statusCode === 200) {
                res.status(200).json({ status: 200, userId: response.userId });
            }
            else {
                res.status(500).json({ status: 500, message: "Internal Server Error" });
            }
        }
        else {
            res.status(response.statusCode).json({ status: response.statusCode, message: response.errorMessage });
        }
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    });
});
app.get('/parcelcheck', (req, res) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    if (!req.query.userId) {
        res.status(400).json({ status: 400, message: 'bad request' });
        return;
    }
    const userId = req.query.userId;
    const docRef = db.collection('users').doc(userId);
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
        if (data || (data !== undefined || data !== null)) {
            if ((data === null || data === void 0 ? void 0 : data.activeParcel.length) > 0) {
                res.status(200).json({ status: 200, parcels: data === null || data === void 0 ? void 0 : data.activeParcel, userData: data === null || data === void 0 ? void 0 : data.userData, lineData: data === null || data === void 0 ? void 0 : data.lineData });
            }
            else {
                res.status(200).json({ status: 200, parcels: [], userData: data === null || data === void 0 ? void 0 : data.userData, lineData: data === null || data === void 0 ? void 0 : data.lineData });
            }
        }
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    });
});
app.get('/allparcellist', (req, res) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    const colRef = db.collection('allActiveParcel');
    fst.getAllParcel(colRef)
        .then((data) => {
        if (data || (data !== undefined || data !== null)) {
            if ((data === null || data === void 0 ? void 0 : data.length) > 0) {
                res.status(200).json({ status: 200, data: [] });
            }
            else {
                res.status(404).json({ status: 404, data: [] });
            }
        }
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    });
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
});
app.get('/getparceldata', (req, res) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    if (!req.query.parcelId) {
        res.status(400).json({ status: 400, message: 'bad request' });
        return;
    }
    const parcelId = req.query.parcelId;
    const docRef = db.collection('allActiveParcel').doc(parcelId);
    fst.getParcelDataFromAllParcel(docRef)
        .then(data => {
        if (!data) {
            res.status(404).json({ status: 404, message: "Parcel not found" });
            return;
        }
        console.log('parcel data found');
        res.status(200).json({ status: 200, data: data });
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    });
});
//parcel delete method
app.post('/parcelrem', (req, res) => {
    //check for api key
    if (req.headers.authorization !== API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    //check for data
    let data;
    try {
        data = req.body;
        if (!data.parcelId) {
            throw new Error('Invalid data');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const docRef = db.collection('allActiveParcel').doc(data.parcelId);
    fst.getParcelDataFromAllParcel(docRef)
        .then(pData => {
        if (!pData) {
            res.status(404).json({ status: 404, message: "Parcel not found" });
            return;
        }
        console.log('parcel data found');
        const userId = pData.userId;
        const userDocRef = db.collection('users').doc(userId);
        fst.getUserActiveParcels(userDocRef)
            .then(returnedData => {
            if ((returnedData === null || returnedData === void 0 ? void 0 : returnedData.activeParcel.length) > 0) {
                fst.dbRemoveDoc(db.collection('allActiveParcel').doc(data.parcelId));
                fst.dbRemoveParcelFromUserData(userDocRef, data.parcelId);
                res.status(200).json({ status: 200, message: "Parcel deleted" });
            }
            else {
                console.log('no active parcels found');
                res.status(404).json({ status: 404, message: "No active parcels found" });
            }
        })
            .catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, message: "Internal Server Error" });
        });
    });
});
https_1.default.createServer(sslCredentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
