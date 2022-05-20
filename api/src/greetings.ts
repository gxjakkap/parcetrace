import axios from 'axios'
import { TextMessage } from '@line/bot-sdk'

export async function sendGreetingMessage(userId: string, channelAccessToken: string, displayName: string) {
    const greetingMessage: TextMessage = { type: 'text', text: `Test greeting text, Hi ${displayName}!` }
    const headers = { 'Authorization': `Bearer ${channelAccessToken}`, 'Content-Type': 'application/json' }
    const body = {
        to: userId,
        messages: [greetingMessage]
    }
    return axios.post('https://api.line.me/v2/bot/message/push', body, { headers: headers })
}

export default { sendGreetingMessage }