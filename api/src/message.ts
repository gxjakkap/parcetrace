import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'
import { userData, parcel } from './firestoreoperation'

const baseUrl = 'https://parcetrace.vercel.app/'

async function sendMessage(message: TextMessage, channelAccessToken: string, userId: string) {
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [message],
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

export async function sendRegistrationConfirmMessage(userId: string, channelAccessToken: string, userData: userData) {
    const message: TextMessage = { type: 'text', text: `ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้ว🗃️\n\nโปรดตรวจสอบความถูกต้องของข้อมูล หากข้อมูลผิดกรุณาแจ้งผู้ดูแลระบบ\n\nชื่อจริง: ${userData.name}\nนามสกุล: ${userData.surname}\nเบอร์โทรศัพท์: ${userData.phoneNumber}\nเลขห้อง: ${userData.room}` }
    return sendMessage(message, channelAccessToken, userId)
}

export async function sendGreetingMessage(userId: string, channelAccessToken: string, displayName: string) {
    const greetingMessage: TextMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}!\nขอบคุณที่เพิ่มเราเป็นเพื่อน☺️🎉\n\n โปรดเพิ่มข้อมูลของคุณในระบบได้ที่ลิงค์ด้านล่าง 👇\n ${baseUrl}regis?userId=${userId}` }
    return sendMessage(greetingMessage, channelAccessToken, userId)
}

export async function sendParcelNotificationMessage(userId: string, channelAccessToken: string, parcelData: parcel) {
    const message: TextMessage = { type: 'text', text: `🔔 กิ๊งก่อง มีพัสดุจาก ${parcelData.carrier} มาส่งค้าบ\n\nกดที่ลิ้งนี้เพื่อยืนยันการรับพัสดุหลังจากได้ลงไปรับพัสดุแล้ว\n${baseUrl}confirmation?parcelId=${parcelData.parcelId}` }
    return sendMessage(message, channelAccessToken, userId)
}

export default { sendRegistrationConfirmMessage, sendGreetingMessage, sendParcelNotificationMessage }