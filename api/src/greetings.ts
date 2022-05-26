import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'

export async function sendGreetingMessage(userId: string, channelAccessToken: string, displayName: string) {
    const greetingMessage: TextMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}! ขอบคุณที่เพิ่มเราเป็นเพื่อน☺️🎉\n\n โปรดเพิ่มข้อมูลของคุณในระบบได้ที่ลิงค์ด้านล่าง 👇\n https://parcetrace.vercel.app/regis?userId=${userId}` }
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [greetingMessage],
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

export default { sendGreetingMessage }