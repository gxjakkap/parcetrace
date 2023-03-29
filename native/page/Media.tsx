/**
 * Majority of the codes here are provided by Marc Rousavy (mrousavy/react-native-vision-camera) under MIT License
 * 
 * Copyright 2021 Marc Rousavy
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, 
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*/

import Video, { LoadError, OnLoadData } from 'react-native-video';
import { useIsFocused } from '@react-navigation/native';
import { PressableOpacity } from 'react-native-pressable-opacity';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import { Platform, PermissionsAndroid, NativeSyntheticEvent, ImageLoadEventData, Text, View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import React from 'react'

import { useIsForeground } from '../hooks/useIsForeground'
import { StatusBarBlurBackground } from '../components/StatusBarBlrBackground';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes';
import { SAFE_AREA_PADDING } from '../etc/constants';

type Props = NativeStackScreenProps<Routes, 'MediaPage'>

const requestSavePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
  
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    if (permission == null) return false;
    let hasPermission = await PermissionsAndroid.check(permission);
    if (!hasPermission) {
      const permissionRequestResult = await PermissionsAndroid.request(permission);
      hasPermission = permissionRequestResult === 'granted';
    }
    return hasPermission;
}

const isVideoOnLoadEvent = (event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>): event is OnLoadData => 'duration' in event && 'naturalSize' in event

const MediaPage = ({ navigation, route }: Props) => {
    const { showBanner, hideBanner } = useToastBannerToggler()

    const { path, type } = route.params;
    const [hasMediaLoaded, setHasMediaLoaded] = React.useState(false);
    const isForeground = useIsForeground();
    const isScreenFocused = useIsFocused();
    const isVideoPaused = !isForeground || !isScreenFocused;
    const [savingState, setSavingState] = React.useState<'none' | 'saving' | 'saved'>('none');

    const onMediaLoad = React.useCallback((event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>) => {
        if (isVideoOnLoadEvent(event)) {
          console.log(
            `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
          );
        } else {
          console.log(`Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`);
        }
    }, []);

    const onMediaLoadEnd = React.useCallback(() => {
        console.log('media has loaded.');
        setHasMediaLoaded(true);
    }, []);
      const onMediaLoadError = React.useCallback((error: LoadError) => {
        console.log(`failed to load media: ${JSON.stringify(error)}`);
    }, []);

    const onSavePressed = React.useCallback(async () => {
        try {
          setSavingState('saving');
    
          const hasPermission = await requestSavePermission();
          if (!hasPermission) {
            showBanner({
                contentView: <Text>Insufficient Permission: CameraRoll</Text>,
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
            return;
          }
          await CameraRoll.save(`file://${path}`, {
            type: type,
          });
          setSavingState('saved');
        } catch (e) {
          const message = e instanceof Error ? e.message : JSON.stringify(e);
          setSavingState('none');
          showBanner({
            contentView: <Text>Saving Failed: {message}</Text>,
            backgroundColor: 'red',
            duration: 2000,
            transitions: [
                Transition.Move,
                Transition.MoveLinear,
                Transition.FadeInOut,
            ]
        })
        }
    }, [path, type]);

    const source = React.useMemo(() => ({ uri: `file://${path}` }), [path]);

    const screenStyle = React.useMemo(() => ({ opacity: hasMediaLoaded ? 1 : 0 }), [hasMediaLoaded]);

    return (
        <View style={screenStyle} className="flex-1 items-center justify-center bg-white">
            {type === 'photo' && (
                <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" onLoadEnd={onMediaLoadEnd} onLoad={onMediaLoad} />
            )}
            {type === 'video' && (
                <Video
                source={source}
                style={StyleSheet.absoluteFill}
                paused={isVideoPaused}
                resizeMode="cover"
                posterResizeMode="cover"
                allowsExternalPlayback={false}
                automaticallyWaitsToMinimizeStalling={false}
                disableFocus={true}
                repeat={true}
                useTextureView={false}
                controls={false}
                playWhenInactive={true}
                ignoreSilentSwitch="ignore"
                onReadyForDisplay={onMediaLoadEnd}
                onLoad={onMediaLoad}
                onError={onMediaLoadError}
                />
            )}

            <PressableOpacity className={`absolute top-[${SAFE_AREA_PADDING.paddingTop}] left-[${SAFE_AREA_PADDING.paddingLeft}] w-[40] h-[40]`} onPress={navigation.goBack}>
                <IonIcon name="close" size={35} color="white"  />
            </PressableOpacity>
            <PressableOpacity className={`absolute bottom-[50] left-[${SAFE_AREA_PADDING.paddingLeft}] w-[40] h-[40]`} onPress={onSavePressed} disabled={savingState !== 'none'}>
                {savingState === 'none' && <IonIcon name="download" size={35} color="white" style={styles.icon} />}
                {savingState === 'saved' && <IonIcon name="checkmark" size={35} color="white" style={styles.icon} />}
                {savingState === 'saving' && <ActivityIndicator color="white" />}
            </PressableOpacity>
            <PressableOpacity className={`absolute bottom-[300] left-[${SAFE_AREA_PADDING.paddingLeft}] w-[40] h-[40]`} onPress={() => {navigation.navigate("OCRPage", {path: path})}}>
                <IonIcon name="document-text-outline" color="white" size={35}/>
            </PressableOpacity>

            <StatusBarBlurBackground />
        </View>
    )
}

const styles = StyleSheet.create({
    icon: {
        textShadowColor: 'black',
        textShadowOffset: {
            height: 0,
            width: 0,
        },
        textShadowRadius: 1,
    }
})

export default MediaPage