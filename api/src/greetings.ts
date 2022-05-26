import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'

export async function sendGreetingMessage(userId: string, channelAccessToken: string, displayName: string) {
    const greetingMessage: TextMessage = { type: 'text', text: `สวัสดีคุณ ${displayName}! ขอบคุณที่เป็นเพื่อนกับเรา$\n โปรดเพิ่มข้อมูลในระบบได้ที่ลิงค์ด้านล่าง$\n https://parcetrace.vercel.app/regis?userId=${userId}` }
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [greetingMessage],
        emojis: [
            {
                index: 0,
                productId: '5ac1bfd5040ab15980c9b435',
                emojiId: '001',
            },
            {
                index: 1,
                productId: '5ac21e6c040ab15980c9b444',
                emojiId: '020'
            }
        ]
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

export default { sendGreetingMessage }