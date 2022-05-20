"use strict";
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
//import axios from 'axios'
const bot_sdk_1 = __importDefault(require("@line/bot-sdk"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
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
//async functions for database operation
const dbSetOnFollow = (ref, userId, displayName, picLink) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.set({
        userId: userId,
        displayName: displayName,
        piclink: picLink
    });
});
const dbSetOnUnfollow = (ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield ref.delete();
});
//https
const sslPrivkey = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem");
const sslCertificate = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem");
const sslCredentials = { key: sslPrivkey, cert: sslCertificate };
//init line client from line sdk
const lineClient = new bot_sdk_1.default.Client({
    channelAccessToken: process.env.CAT
});
const channelAccessToken = process.env.CAT;
//init express app
const app = (0, express_1.default)();
//use json middleware
app.use(express_1.default.json());
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
                    let message = { type: 'text', text: `Test greeting text, Hi ${data.data.displayName}!` }; // greeting message
                    lineClient.pushMessage(body.events[i].source.userId, message);
                    const docRef = db.collection('friends').doc(body.events[i].source.userId);
                    dbSetOnFollow(docRef, data.data.userId, data.data.displayName, data.data.pictureUrl).catch(err => { console.log(err); });
                });
            }
            else if (body.events[i].type === 'unfollow') {
                const docRef = db.collection('friends').doc(body.events[i].source.userId);
                dbSetOnUnfollow(docRef);
            }
        }
    }
    console.log('webhook recieved');
    res.json({}).status(200);
});
//test path
app.get('/test', (req, res) => {
    const userId = req.query.id;
    const message = {
        to: userId,
        messages: [
            {
                type: 'text',
                text: 'Hello World.'
            }
        ]
    };
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
    };
    axios_1.default.post('https://api.line.me/v2/bot/message/push', message, headers)
        .then(() => {
        res.send(`Sent message to ${userId}`);
    })
        .catch(err => {
        console.log(err);
    });
    /* client.pushMessage(userId, message as any)
        .then(() => {
            res.send(`Sent message to ${userId}`)
        })
        .catch(err => {
            console.log(err)
        }) */
});
/* app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) */
https_1.default.createServer(sslCredentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
