import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Image, NativeSyntheticEvent, ImageLoadEventData } from 'react-native';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as SecureStore from 'expo-secure-store';
import * as React from 'react';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'
import { LoadError } from 'react-native-video';

type Props = NativeStackScreenProps<Routes, 'OCRTestPage'>

export default function OCRTestPage ({ navigation, route }: Props){
    const { showBanner, hideBanner } = useToastBannerToggler()
    const { path } = route.params

    const source = React.useMemo(() => ({ uri: `file://${path}` }), [path]);

    const [hasMediaLoaded, setHasMediaLoaded] = React.useState(false);
    const [imageHeight, setImageHeight] = React.useState(500)
    const [recogResult, setRecogResult] = React.useState("")

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

    const recog = async(imageUrl: string) => {
        const result = await TextRecognition.recognize(imageUrl)
        setRecogResult(result.text)
    }

    return (
        <View className="flex-1 bg-white justify-center px-10">
            <Image source={source} className={`w-screen h-[${imageHeight}]`} resizeMode="cover" onLoadEnd={onMediaLoadEnd} onLoad={onMediaLoad} />
            <Button onPress={() => recog(source.uri)} title="Recog" />
            <Text>{recogResult}</Text>
        </View>
    )
}