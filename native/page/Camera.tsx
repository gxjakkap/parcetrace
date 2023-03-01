/**
 * Majority of the codes here provided by Marc Rousavy (mrousavy/react-native-vision-camera) under MIT License
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

import { useIsFocused } from '@react-navigation/native';
import {
    Camera,
    CameraDeviceFormat,
    CameraRuntimeError,
    FrameProcessorPerformanceSuggestion,
    frameRateIncluded,
    PhotoFile,
    sortFormats,
    useCameraDevices,
    useFrameProcessor,
    VideoFile,
} from 'react-native-vision-camera';
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler } from 'react-native-gesture-handler';
import { PressableOpacity } from 'react-native-pressable-opacity';import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet, Text, Platform } from 'react-native';
import * as React from 'react';

import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from '../etc/constants';

import { CaptureButton } from '../components/CaptureButton';
import { StatusBarBlurBackground } from '../components/StatusBarBlrBackground';

import { useIsForeground } from '../hooks/useIsForeground';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'

type Props = NativeStackScreenProps<Routes, 'CameraPage'>

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;

const CameraPage = ({ navigation }: Props) => {
    const camera = React.useRef<Camera>(null)
    const [cameraInitStatus, setCameraInitStatus] = React.useState(false)
    const [hasMicrophonePermission, setHasMicrophonePermission] = React.useState(false)
    const zoom = useSharedValue(0)
    const isPressingButton = useSharedValue(false)

    const isFocused = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocused && isForeground

    const [cameraPosition, setCameraPosition] = React.useState<'front' | 'back'>('back')
    const [flash, setFlash] = React.useState<'off' | 'on'>('off')
    
    // camera format settings
    const devices = useCameraDevices();
    const device = devices[cameraPosition];
    const formats = React.useMemo<CameraDeviceFormat[]>(() => {
        if (device?.formats == null) return [];
        return device.formats.sort(sortFormats);
    }, [device?.formats]);

    //#region Memos
    const [is60Fps, setIs60Fps] = React.useState(true);
    const fps = 30;

    const supportsCameraFlipping = React.useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
    const supportsFlash = device?.hasFlash ?? false;
    //#endregion

    const format = React.useMemo(() => {
        let result = formats;
        return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)));
    }, [formats, fps]);

    //#region Animated Zoom
    // This just maps the zoom factor to a percentage value.
    // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
    const minZoom = device?.minZoom ?? 1;
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

    const cameraAnimatedProps = useAnimatedProps(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
        return {
          zoom: z,
        };
      }, [maxZoom, minZoom, zoom]);
    //#endregion

    //#region Callbacks
    const setIsPressingButton = React.useCallback(
        (_isPressingButton: boolean) => {
        isPressingButton.value = _isPressingButton;
        },
        [isPressingButton],
    );
    // Camera callbacks
    const onError = React.useCallback((error: CameraRuntimeError) => {
        console.error(error);
    }, []);

    const onInitialized = React.useCallback(() => {
        console.log('Camera initialized!');
        setCameraInitStatus(true);
    }, []);
    const onMediaCaptured = React.useCallback(
        (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
            console.log(`Media captured! ${JSON.stringify(media)}`);
            navigation.navigate('MediaPage', {
                path: media.path,
                type: type,
            });
        },
        [navigation],
    );
    const onFlipCameraPressed = React.useCallback(() => {
        setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
    }, []);
    const onFlashPressed = React.useCallback(() => {
        setFlash((f) => (f === 'off' ? 'on' : 'off'));
    }, []);
    //#endregion

    //#region Tap Gesture
    const onDoubleTap = React.useCallback(() => {
        onFlipCameraPressed();
    }, [onFlipCameraPressed]);
    //#endregion

    //#region Effects
    const neutralZoom = device?.neutralZoom ?? 1;
    React.useEffect(() => {
        // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
        zoom.value = neutralZoom;
    }, [neutralZoom, zoom]);
    React.useEffect(() => {
        Camera.getMicrophonePermissionStatus().then((status) => setHasMicrophonePermission(status === 'authorized'));
      }, []);
    //#endregion

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
        onStart: (_, context) => {
        context.startZoom = zoom.value;
        },
        onActive: (event, context) => {
        // we're trying to map the scale gesture to a linear zoom here
        const startZoom = context.startZoom ?? 0;
        const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP);
        zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP);
        },
    });
    //#endregion

    if (device != null && format != null) {
        console.log(
          `Re-rendering camera page with ${isActive ? 'active' : 'inactive'} camera. ` +
            `Device: "${device.name}" (${format.photoWidth}x${format.photoHeight} @ ${fps}fps)`,
        );
    } 
    else {
        console.log('re-rendering camera page without active camera');
    }

    /* const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
        const values = examplePlugin(frame);
        console.log(`Return Values: ${JSON.stringify(values)}`);
    }, []);

    const onFrameProcessorSuggestionAvailable = useCallback((suggestion: FrameProcessorPerformanceSuggestion) => {
        console.log(`Suggestion available! ${suggestion.type}: Can do ${suggestion.suggestedFrameProcessorFps} FPS`);
    }, []); */
    
    

    return (
        <View className='flex-1 bg-black'>
            {device != null && (
                <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
                <Reanimated.View style={StyleSheet.absoluteFill}>
                    <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                    <ReanimatedCamera
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        format={undefined}
                        preset={"hd-1920x1080"}
                        /* fps={fps} */
                        isActive={isActive}
                        onInitialized={onInitialized}
                        onError={onError}
                        enableZoomGesture={true}
                        animatedProps={cameraAnimatedProps}
                        photo={true}
                        video={true}
                        audio={hasMicrophonePermission}
                        /* frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined} */
                        orientation="portrait"
                        /* frameProcessorFps={1} */
                        /* onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable} */
                    />
                    </TapGestureHandler>
                </Reanimated.View>
                </PinchGestureHandler>
            )}

            <CaptureButton
                className={`absolute left-[41%] bottom-4`}
                camera={camera}
                onMediaCaptured={onMediaCaptured}
                cameraZoom={zoom}
                minZoom={minZoom}
                maxZoom={maxZoom}
                flash={supportsFlash ? flash : 'off'}
                enabled={cameraInitStatus && isActive}
                setIsPressingButton={setIsPressingButton}
            />

            <StatusBarBlurBackground />

            <View className={`absolute right-[15] top-[15]`}>
                {supportsCameraFlipping && (
                <PressableOpacity className={`mb-[${CONTENT_SPACING}] w-[${BUTTON_SIZE}] h-[${BUTTON_SIZE}] rounded-[${BUTTON_SIZE / 2}] bg-gray-400 justify-center items-center`} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
                    <IonIcon name="camera-reverse" color="white" size={24} />
                </PressableOpacity>
                )}
                {supportsFlash && (
                <PressableOpacity className={`mb-[${CONTENT_SPACING}] w-[${BUTTON_SIZE}] h-[${BUTTON_SIZE}] rounded-[${BUTTON_SIZE / 2}] bg-gray-400 justify-center items-center`} onPress={onFlashPressed} disabledOpacity={0.4}>
                    <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} />
                </PressableOpacity>
                )}
            </View>
        </View>
    )
}

export default CameraPage