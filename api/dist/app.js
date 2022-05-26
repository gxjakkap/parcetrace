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
const express_bearer_token_1 = __importDefault(require("express-bearer-token"));
const greetings_1 = require("./greetings");
const fst = __importStar(require("./firestoreoperation"));
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
/* //init line client from line sdk
const lineClient = new line.Client({
    channelAccessToken: process.env.CAT as string
}) */
const channelAccessToken = process.env.CAT;
//init express app
const app = (0, express_1.default)();
//use json middleware
app.use(express_1.default.json());
//use bearer token middleware
app.use((0, express_bearer_token_1.default)());
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
            else if (body.events[i].type === 'unfollow') {
                const docRef = db.collection('friends').doc(body.events[i].source.userId);
                fst.dbRemoveOnUnfollow(docRef);
            }
        }
    }
    console.log('webhook recieved');
    res.json({}).status(200);
});
//unfinished
//parcel register path
app.post('/parcelreg', (req, res) => {
    const body = req.body;
});
app.post('/userreg', (req, res) => {
    //check for api key
    if (req.token !== process.env.API_KEY) {
        res.json({ status: 401, message: "Unauthorized" }).status(401);
        console.log('Unauthorized request recieved');
        return;
    }
    const data = req.body;
    const friendDocRef = db.collection('friends').doc(data.userId);
    fst.checkIfUserIsEligible(friendDocRef, data.userId)
        .then(eligible => {
        if (eligible) {
            const userDocRef = db.collection('users').doc(data.userId);
            fst.dbSetOnUserRegister(userDocRef, data)
                .then(() => {
                console.log('user registered');
            })
                .catch(err => {
                console.log(err);
                res.json({ status: 500, message: "Internal Server Error" }).status(500);
            });
        }
        else {
            res.json({ status: 403, message: "Forbidden" }).status(403);
            console.log('Forbidden request recieved');
        }
    });
});
https_1.default.createServer(sslCredentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
