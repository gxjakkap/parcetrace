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
exports.sendParcelNotificationMessage = exports.sendGreetingMessage = exports.sendRegistrationConfirmMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const baseUrl = 'https://parcetrace.vercel.app/';
function sendMessage(message, channelAccessToken, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' };
        const body = {
            to: userId,
            messages: [message],
        };
        return axios_1.default.post('https://api.line.me/v2/bot/message/push', body, { headers: headers });
    });
}
function sendRegistrationConfirmMessage(userId, channelAccessToken, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = { type: 'text', text: `ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้ว🗃️\n\nโปรดตรวจสอบความถูกต้องของข้อมูล หากข้อมูลผิดกรุณาแจ้งผู้ดูแลระบบ\n\nชื่อจริง: ${userData.name}\nนามสกุล: ${userData.surname}\nเบอร์โทรศัพท์: ${userData.phoneNumber}\nเลขห้อง: ${userData.room}` };
        return sendMessage(message, channelAccessToken, userId);
    });
}
exports.sendRegistrationConfirmMessage = sendRegistrationConfirmMessage;
function sendGreetingMessage(userId, channelAccessToken, displayName) {
    return __awaiter(this, void 0, void 0, function* () {
        const greetingMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}!\nขอบคุณที่เพิ่มเราเป็นเพื่อน☺️🎉\n\n โปรดเพิ่มข้อมูลของคุณในระบบได้ที่ลิงค์ด้านล่าง 👇\n ${baseUrl}regis?userId=${userId}` };
        return sendMessage(greetingMessage, channelAccessToken, userId);
    });
}
exports.sendGreetingMessage = sendGreetingMessage;
function sendParcelNotificationMessage(userId, channelAccessToken, parcelData) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = { type: 'text', text: `🔔 กิ๊งก่อง มีพัสดุมาส่งค้าบ\n\nผู้ส่ง: ${parcelData.sender}\nจุดรับพัสดุ: ${parcelData.location}\n\nกดที่ลิ้งนี้เพื่อยืนยันการรับพัสดุหลังจากได้ลงไปรับพัสดุแล้ว\n${baseUrl}confirmation?parcelId=${parcelData.parcelId}` };
        return sendMessage(message, channelAccessToken, userId);
    });
}
exports.sendParcelNotificationMessage = sendParcelNotificationMessage;
exports.default = { sendRegistrationConfirmMessage, sendGreetingMessage, sendParcelNotificationMessage };
