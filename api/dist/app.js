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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const uuid_1 = require("uuid");
const node_querystring_1 = require("node:querystring");
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
    credential: (0, app_1.cert)(serviceAccount),
    storageBucket: 'parcetrace.appspot.com'
});
const db = (0, firestore_1.getFirestore)();
const bucket = (0, storage_1.getStorage)().bucket();
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
        if (!body.sender || !body.location || !body.userId || !body.parcelId)
            throw Error('value missing');
    }
    catch (err) {
        console.log(err);
        res.status(400).json({ status: 400, message: 'bad request' });
    }
    console.log(body);
    const date = new Date;
    const dataForUser = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: body.userId, location: body.location };
    const dataForAllActive = { status: 'available', date: date.getTime(), sender: body.sender, parcelId: body.userId, userId: body.userId, location: body.location };
    const userRef = db.collection('users').doc(body.userId);
    const allActiveRef = db.collection('allActiveParcel').doc(body.userId);
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
            throw new Error('Invalid data (trace: userreg)');
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
                res.status(200).json({ status: 200, data: data });
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
            throw new Error('Invalid data (trace: parcelrem)');
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
/**  registering mobile device for the first time, the flow is
 *      - recieve master password provided by client
 *      - retrieve the salt from the database
 *      - hash client provided password and compare it to the hash stored in the database
 *      - if it matches, then the server will generate a new session id and store it on the database
 *      - it will then response with sessionid generated *
 */
app.post('/adminapp/authen', (req, res) => {
    let data;
    try {
        data = req.body;
        if (!data.password) {
            throw new Error('Invalid data (trace: adminapp/authen)');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const docRef = db.collection('credentials').doc('mobilemasterkey');
    docRef.get().then(doc => {
        const docdata = doc.data();
        const hash = crypto_1.default.createHash('sha256').update(data.password + (docdata === null || docdata === void 0 ? void 0 : docdata.salt)).digest('hex');
        if (hash == (docdata === null || docdata === void 0 ? void 0 : docdata.hash)) {
            const newuuid = (0, uuid_1.v4)();
            const ssref = db.collection('activeMobileSession');
            const newsession = {
                id: newuuid,
                userAgent: data.userAgent,
                dateAdded: Date.now()
            };
            ssref.add(newsession).then(nref => {
                if (nref) {
                    res.status(200).json({ status: 200, sessionid: newuuid });
                }
                else {
                    res.status(500).json({ status: 500, message: "Internal Server Error" });
                }
            });
        }
        else {
            res.status(401).json({ status: 401, message: "Wrong Password!" });
        }
    });
});
/**
 * Remove session aka. logout.
 * remove that session from the database.
 */
app.post('/adminapp/logout', (req, res) => {
    let data;
    try {
        data = req.body;
        if (!data.sessionid) {
            throw new Error('Invalid data (trace: adminapp/logout)');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const docRef = db.collection('activeMobileSession');
    docRef.where('id', '==', data.sessionid).get()
        .then(snapshot => {
        if (snapshot.empty) {
            res.status(404).json({ message: "Session doesn't exist" });
            return;
        }
        if (snapshot.size > 1) {
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }
        db.collection('activeMobileSession').doc(snapshot.docs[0].id).delete()
            .then(x => {
            res.status(200).json({ message: "Success" });
        })
            .catch(err => {
            res.status(500).json({ message: "Internal Server Error" });
        });
    });
});
app.post('/adminapp/ocr', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    try {
        data = req.body;
        if (!data.sessionid || !data.imageUrl || !data.parcelId) {
            throw new Error('Invalid data (trace: adminapp/ocr)');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const { sessionid, imageUrl, parcelId } = data;
    const docRef = db.collection('activeMobileSession');
    const snapshot = yield docRef.where('id', '==', sessionid).get();
    if (snapshot.empty) {
        res.status(401).json({ message: "Session doesn't exist" });
        return;
    }
    if (snapshot.size > 1) {
        res.status(500).json({ message: "Internal Server Error (trace: adminadd/ocr dupesession)" });
        return;
    }
    let ocrText = "";
    try {
        const ocrRes = yield axios_1.default.get(`${process.env.OCR_GS}?${(0, node_querystring_1.stringify)({ imageurl: imageUrl })}`);
        if (ocrRes.status !== 200) {
            res.status(500).json({ status: 500, message: "Internal Server Error (trace: ocr req)" });
            return;
        }
        console.log(ocrRes);
        console.log(typeof ocrRes);
        ocrText = ocrRes.toString();
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ status: 500, message: "Internal Server Error (trace: ocr req)" });
    }
    ocrText = ocrText.substring(2);
    res.status(200).json({ status: 200, text: ocrText, id: parcelId });
}));
https_1.default.createServer(sslCredentials, app)
    .listen(port, () => { console.log(`App listening on port ${port}`); });
