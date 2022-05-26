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
exports.sendGreetingMessage = void 0;
const axios_1 = __importDefault(require("axios"));
function sendGreetingMessage(userId, channelAccessToken, displayName) {
    return __awaiter(this, void 0, void 0, function* () {
        const greetingMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}! ขอบคุณที่เป็นเพื่อนกับเรา☺️🎉\n โปรดเพิ่มข้อมูลในระบบได้ที่ลิงค์ด้านล่าง 👇\n https://parcetrace.vercel.app/regis?userId=${userId}` };
        const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' };
        const body = {
            to: userId,
            messages: [greetingMessage],
        };
        return axios_1.default.post('https://api.line.me/v2/bot/message/push', body, { headers: headers });
    });
}
exports.sendGreetingMessage = sendGreetingMessage;
exports.default = { sendGreetingMessage };
