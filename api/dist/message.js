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
exports.sendRegistrationConfirmMessage = void 0;
const axios_1 = __importDefault(require("axios"));
function sendRegistrationConfirmMessage(userId, channelAccessToken, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = { type: 'text', text: `ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้ว🗃️\n โปรดตรวจสอบความถูกต้องของข้อมูล หากข้อมูลผิดกรุณาแจ้งผู้ดูแลระบบ\n\nชื่อจริง: ${userData.name}\n\nนามสกุล: ${userData.surname}\n\nเบอร์โทรศัพท์: ${userData.phoneNumber}\n\nเลขห้อง: ${userData.room}` };
        const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' };
        const body = {
            to: userId,
            messages: [message],
        };
        return axios_1.default.post('https://api.line.me/v2/bot/message/push', body, { headers: headers });
    });
}
exports.sendRegistrationConfirmMessage = sendRegistrationConfirmMessage;
exports.default = { sendRegistrationConfirmMessage };
