import axios from "axios"
import { stringify as queryStringify } from 'node:querystring';

export const ggAppsScript = async (imageUrl: string) => {
    const ocrRes = await axios.get(`${process.env.OCR_GS}?${queryStringify({imageurl: imageUrl})}`)
    if (ocrRes.status !== 200){
        throw Error('Response Error: ggApps OCR')
    }
    return ocrRes.data.toString()
}

export const easyOCR = async (imageUrl: string) => {
    const ocrRes = await axios.post('http://127.0.0.1:3487/easyocr', { image: imageUrl }, {headers: {'Content-Type': 'application/json'}})
    return ocrRes.data['data']
}

export default { ggAppsScript, easyOCR }
