export const API_KEY = import.meta.env.VITE_API_KEY as string
export const API_URL = import.meta.env.VITE_API_URL as string
//export const FIREBASE_CONFIG = import.meta.env.VITE_FIREBASE_CONFIG as string

export const FIREBASE_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PRJID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STRGEBKT as string,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MSGID as string,
    appId: import.meta.env.VITE_FIREBASE_APPID as string,
}