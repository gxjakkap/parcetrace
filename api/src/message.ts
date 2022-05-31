import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'
import { userData } from './firestoreoperation'

export async function sendRegistrationConfirmMessage(userId: string, channelAccessToken: string, userData: userData) {
    const message: TextMessage = { type: 'text', text: `ลงทะเบียนสำเร็จ! ข้อมูลของคุณถูกบันทึกในระบบเรียบร้อยแล้ว🗃️\n โปรดตรวจสอบความถูกต้องของข้อมูล หากข้อมูลผิดกรุณาแจ้งผู้ดูแลระบบ\n\nชื่อจริง: ${userData.name}\n\nนามสกุล: ${userData.surname}\n\nเบอร์โทรศัพท์: ${userData.phoneNumber}\n\nเลขห้อง: ${userData.room}` }
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [message],
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

export default { sendRegistrationConfirmMessage }