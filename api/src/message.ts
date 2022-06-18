import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'
import { userData, userParcel, allParcel } from './firestoreoperation'

const baseUrl = 'https://parcetrace.vercel.app/'

async function sendMessage(message: TextMessage, channelAccessToken: string, userId: string) {
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [message],
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

const localeDateString = (date: number) => {
    let epdate = new Date(date)
    return epdate.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    })
}

export async function sendRegistrationConfirmMessage(userId: string, channelAccessToken: string, userData: userData) {
    const message: TextMessage = { type: 'text', text: `ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้ว🗃️\n\nโปรดตรวจสอบความถูกต้องของข้อมูล หากข้อมูลผิดกรุณาแจ้งผู้ดูแลระบบ\n\nชื่อจริง: ${userData.name}\nนามสกุล: ${userData.surname}\nเบอร์โทรศัพท์: ${userData.phoneNumber}\nเลขห้อง: ${userData.room}` }
    return sendMessage(message, channelAccessToken, userId)
}

export async function sendGreetingMessage(userId: string, channelAccessToken: string, displayName: string) {
    const greetingMessage: TextMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}!\nขอบคุณที่เพิ่มเราเป็นเพื่อน☺️🎉\n\n โปรดเพิ่มข้อมูลของคุณในระบบได้ที่ลิงค์ด้านล่าง 👇\n ${baseUrl}regis?userId=${userId}` }
    return sendMessage(greetingMessage, channelAccessToken, userId)
}

export async function sendParcelNotificationMessage(userId: string, channelAccessToken: string, parcelData: userParcel) {
    const message: TextMessage = { type: 'text', text: `🔔 กิ๊งก่อง มีพัสดุมาส่งค้าบ📦\n\nผู้ส่ง: ${parcelData.sender}\nจุดรับพัสดุ: ${parcelData.location}\n\nกดที่ลิ้งนี้เพื่อยืนยันการรับพัสดุหลังจากได้ลงไปรับพัสดุแล้ว\n${baseUrl}confirmation?pid=${parcelData.parcelId}` }
    return sendMessage(message, channelAccessToken, userId)
}

export async function sendParcelRecievedNotificationMessage(userId: string, channelAccessToken: string, parcelData: allParcel) {
    const now = new Date().getTime()
    const message: TextMessage = { type: 'text', text: `📦🪧พัสดุของคุณถูกรับไปแล้ว\n\nผู้ส่ง: ${parcelData.sender}\nจุดรับพัสดุ: ${parcelData.location}\nวันที่พัสดุมาถึง: ${localeDateString(parcelData.date)}\nวันที่พัสดุถูกรับไป: ${localeDateString(now)}\n\nหากนี่ไม่ใช่คุณ โปรดแจ้งนิติบุคคล` }
    return sendMessage(message, channelAccessToken, userId)
}

export default { sendRegistrationConfirmMessage, sendGreetingMessage, sendParcelNotificationMessage, sendParcelRecievedNotificationMessage }