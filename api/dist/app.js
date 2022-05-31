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
//import line from '@line/bot-sdk'
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const greetings_1 = require("./greetings");
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
                console.log(body.events[i].source.userId);
                axios_1.default.get(`https://api.line.me/v2/bot/profile/${body.events[i].source.userId}`, {
                    headers: {
                        Authorization: `Bearer ${channelAccessToken}`
                    }
                })
                    .then(data => {
                    (0, greetings_1.sendGreetingMessage)(body.events[i].source.userId, channelAccessToken, data.data.displayName).catch(err => { console.log(err); });
                    const docRef = db.collection('friends').doc(body.events[i].source.userId);
                    fst.dbSetOnFollow(docRef, { userId: data.data.userId, displayName: data.data.displayName, picLink: data.data.pictureUrl }).catch(err => { console.log(err); });
                });
            }
            /*
            *   Unfollow event
            *   - remove user from friends collection
            *   - remove user from user collection
            */
            else if (body.events[i].type === 'unfollow') {
                const friendDocRef = db.collection('friends').doc(body.events[i].source.userId);
                const userDocRef = db.collection('users').doc(body.events[i].source.userId);
                fst.dbRemoveOnUnfollow(friendDocRef, userDocRef).catch(err => { console.log(err); });
            }
        }
    }
    console.log('webhook recieved');
    res.status(200).json({});
});
//unfinished
//parcel register path
app.post('/parcelreg', (req, res) => {
    const body = req.body;
});
app.post('/userreg', (req, res) => {
    //TODO: remove console.log
    //check for api key
    if (req.headers.authorization !== process.env.API_KEY) {
        res.status(401).json({ status: 401, message: "Unauthorized" });
        console.log('Unauthorized request recieved');
        return;
    }
    let data;
    try {
        data = req.body;
        if (data.userId === undefined || data.displayName === undefined || data.picLink === undefined) {
            throw new Error('Invalid data');
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, message: "Bad Request" });
        console.log('Bad request recieved');
        console.log(err);
        return;
    }
    const friendDocRef = db.collection('friends').doc(data.userId);
    fst.checkIfDocumentExist(friendDocRef)
        .then(eligible => {
        if (eligible) {
            const userDocRef = db.collection('users').doc(data.userId);
            fst.checkIfDocumentExist(userDocRef).then(exist => {
                if (exist) {
                    res.status(409).json({ status: 409, message: "User already exists" });
                    console.log('User already exists');
                }
                else {
                    fst.dbSetOnUserRegister(userDocRef, data)
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
            });
        }
        else {
            res.status(403).json({ status: 403, message: "Forbidden" });
            console.log('Forbidden request recieved');
        }
    });
});
https_1.default.createServer(sslCredentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
