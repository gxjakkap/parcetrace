import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, NativeSyntheticEvent, ImageLoadEventData, ActivityIndicator, Pressable } from 'react-native';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import DropDownPicker from 'react-native-dropdown-picker';
import * as SecureStore from 'expo-secure-store';
import * as React from 'react';
import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto'
/* import  { v4 as uuidv4 } from 'uuid'; */
//import { v4 as uuidv4 } from 'uuid';

/* import app from '../etc/firebase'; */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'
import { LoadError } from 'react-native-video';

interface nextPageDropdownItem {
    label: string,
    value: string
}

type Props = NativeStackScreenProps<Routes, 'OCRPage'>

export default function OCRPage ({ navigation, route }: Props){
    const { showBanner, hideBanner } = useToastBannerToggler()
    const { path } = route.params


    //change firebase config to your own if you're using your own firebase project
    const config = {
        apiKey: "AIzaSyBO0BW6W6x9a915yYxLQZ1Do8JJcjtATSM",
        authDomain: "parcetrace.firebaseapp.com",
        projectId: "parcetrace",
        storageBucket: "parcetrace.appspot.com",
        messagingSenderId: "610345527016",
        appId: "1:610345527016:web:dd607926e3f9474d754b5d"
    }

    const app = initializeApp(config)

    const storage = getStorage(app)

    const source = React.useMemo(() => ({ uri: `file://${path}` }), [path]);

    const [loadingStatus, setLoading] = React.useState(false)
   

    const [hasMediaLoaded, setHasMediaLoaded] = React.useState(false);
    const [imageHeight, setImageHeight] = React.useState(500)
    const [recogResult, setRecogResult] = React.useState([])

    //dropdown
    const [ddOpen, setDDOpen] = React.useState(false)
    const [ddValue, setDDValue] = React.useState('easyocr')
    const [items, setItems] = React.useState([{label: 'Google Apps Script', value: 'ggapps'}, {label: 'EasyOCR (Default)', value: 'easyocr'}])

    const [showNextButton, setNextButtonPresence] = React.useState(false)

    const onMediaLoad = React.useCallback((event: NativeSyntheticEvent<ImageLoadEventData>) => {
        if (event.nativeEvent.source.height <= 500){
            setImageHeight(event.nativeEvent.source.height)
        }
        console.log(`Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`);
    }, []);

    const onMediaLoadEnd = React.useCallback(() => {
        console.log('media has loaded.');
        setHasMediaLoaded(true);
    }, []);
    const onMediaLoadError = React.useCallback((error: LoadError) => {
        console.log(`failed to load media: ${JSON.stringify(error)}`);
    }, []);

    const getBlobFromPath = async (imageUri: string) => {
        const blob: Blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = () => {
                resolve(xhr.response)
            }
            xhr.onerror = (err) => {
                console.log(err)
                reject(new Error("Blob req failed"))
            }
            xhr.responseType = 'blob'
            xhr.open('GET', imageUri, true)
            xhr.send(null)
        })
        return blob
    }

    const uploadImage = async (id: string, imagePath: string) => {
        const reference = ref(storage, `user_parcels/${id}.jpg`)
        const imageBlob = await getBlobFromPath(imagePath)
        return uploadBytesResumable(reference, imageBlob)
    }

    const recogRes = async (id: string, imageUrl: string) => {
        const sessionId = await SecureStore.getItemAsync('session')
        const reqBody = {
            sessionid: sessionId,
            imageUrl: imageUrl,
            parcelId: id,
            mode: ddValue
        }
        console.log(reqBody)
        const res = await fetch('https://api.guntxjakka.me/adminapp/ocr', {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody)})
        if (res.status !== 200){
            throw Error('Request Error: recogRes')
        }
        const body = await res.json()
        const { text } = body
        console.log(body)
        return text
    }

    const recog = async(imageUrl: string) => {
        if (!ddValue || ddValue == null){
            showBanner({
                contentView: <Text>Error: Choose OCR Mode first!</Text>,
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
            return
        }
        setLoading(true)
        const id = Crypto.randomUUID()
        const upload = await uploadImage(id, imageUrl)
        upload.task.on('state_changed', (snapshot) => {
            // state update: for byte transfer related ops like loading bar
        }, (err) => {
            // on error
            setLoading(false)
            console.log(err)
            showBanner({
                contentView: <Text>Error: Upload Failed!</Text>,
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
        }, async () => {
            // on successful
            const downloadUrl = await getDownloadURL(ref(storage, `user_parcels/${id}.jpg`))
            const text = await recogRes(id, downloadUrl)
            setRecogResult(text)
            setNextButtonPresence(true)
            setLoading(false)
        })
        /* const result = await TextRecognition.recognize(imageUrl)
        setRecogResult(result.text) */
    }

    return (
        <View className="flex-1 bg-white justify-center px-10">
            {loadingStatus ? (
                <>
                    <ActivityIndicator size="large" />
                    <Text className='text-center'>Loading...</Text>
                </>
            ) : (
                <>
                    {/* <Image source={source} className={`w-screen h-[${imageHeight}]`} resizeMode="cover" onLoadEnd={onMediaLoadEnd} onLoad={onMediaLoad} /> */}
                    <Text className="text-3xl text-center">OCR</Text>
                    <Pressable className='items-center justify-center py-5 px-[10] border-[4] mt-20 mb-2 bg-black rounded-xl' onPress={() => recog(source.uri)}><Text className='text-white'>Start</Text></Pressable>
                    <Text>OCR Method</Text>
                    <DropDownPicker
                        open={ddOpen}
                        value={ddValue}
                        items={items}
                        setOpen={setDDOpen}
                        setValue={setDDValue}
                        setItems={setItems}
                    />
                    {showNextButton ? (
                        <Pressable
                        className='items-center justify-center py-5 px-[10] border-[4] mt-20 mb-2 bg-black rounded-xl'
                        onPress={() => {
                            let ddI: nextPageDropdownItem[] = []
                            recogResult.forEach(i => {
                                ddI.push({label: i, value: i})
                            })
                            navigation.navigate("ParcelAddPage", { rawData: recogResult, dropdownItems: ddI })
                        }}
                    ><Text className='text-white'>Next</Text></Pressable>
                    ) : (<></>)}
                </>
            )}  
        </View>
    )
}