"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
//set port
const port = process.env.port || 3000;
//https
const privkey = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/privkey.pem");
const cert = fs_1.default.readFileSync("/etc/letsencrypt/live/api.guntxjakka.me/fullchain.pem");
const credentials = { key: privkey, cert: cert };
/* //init line client from line sdk
const client = new line.Client({
    channelAccessToken: process.env.CAT as string
}) */
const channelAccessToken = process.env.CAT;
//init express app
const app = (0, express_1.default)();
//use json middleware
app.use(express_1.default.json());
//webhook path
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
https_1.default.createServer(credentials, app)
    .listen(port, () => {
    console.log(`App listening on port ${port}`);
});
