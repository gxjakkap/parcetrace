"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//import axios from 'axios'
const bot_sdk_1 = __importDefault(require("@line/bot-sdk"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
//set port
const port = process.env.port || 3000;
//https
const privkey = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem");
const cert = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem");
const credentials = { key: privkey, cert: cert };
//init line client from line sdk
const client = new bot_sdk_1.default.Client({
    channelAccessToken: process.env.CAT
});
//init express app
const app = (0, express_1.default)();
//use json middleware
app.use(express_1.default.json());
//webhook path
app.get('/test', (req, res) => {
    const userId = req.query.id;
    const message = {
        type: 'text',
        text: 'Hello World.'
    };
    client.pushMessage(userId, message)
        .then(() => {
        res.send(`Sent message to ${userId}`);
    })
        .catch(err => {
        console.log(err);
    });
});
/* app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) */
https_1.default.createServer(credentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
