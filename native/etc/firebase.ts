import { initializeApp } from 'firebase/app'
import { proc } from 'react-native-reanimated'

const config = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    appId: process.env.appId,
    messagingSenderId: process.env.messagingSenderId,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket
}

console.log(config)

export const app = initializeApp(config)

export default app