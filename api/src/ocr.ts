import axios from "axios"
import { stringify as queryStringify } from 'node:querystring';

export const ggAppsScript = async (imageUrl: string) => {
    const ocrRes = await axios.get(`${process.env.OCR_GS}?${queryStringify({imageurl: imageUrl})}`)
    if (ocrRes.status !== 200){
        throw Error('Response Error: ggApps OCR')
    }
    let data: string = ocrRes.data.toString()
    if (data.startsWith("\n")){
        data = data.substring(1)
    }
    const dataArr = data.split("\n")
    return dataArr
}

export const easyOCR = async (imageUrl: string) => {
    const ocrRes = await axios.post(`https://${process.env.OCRSERVER}/easyocr`, { image: imageUrl }, {headers: {'Content-Type': 'application/json'}})
    return ocrRes.data['data']
}

export default { ggAppsScript, easyOCR }
