import React, { useCallback, useEffect, useState } from 'react';
import { ImageRequireSource, Linking } from 'react-native';

import { StyleSheet, View, Text, Image } from 'react-native';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import { CONTENT_SPACING, SAFE_AREA_PADDING } from '../etc/constants';

import permissionState from '../context/permissionState';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BANNER_IMAGE = require('../assets/icon.png') as ImageRequireSource;

type Props = NativeStackScreenProps<Routes, 'PermissionPage'>;

export default function PermissionsPage({ navigation }: Props): React.ReactElement {
    const permContext = React.useContext(permissionState)

    const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('not-determined');
    const [microphonePermissionStatus, setMicrophonePermissionStatus] = useState<CameraPermissionStatus>('not-determined');

    const requestMicrophonePermission = useCallback(async () => {
        console.log('Requesting microphone permission...');
        const permission = await Camera.requestMicrophonePermission();
        console.log(`Microphone permission status: ${permission}`);

        if (permission === 'denied') await Linking.openSettings();
        setMicrophonePermissionStatus(permission);
    }, []);

    const requestCameraPermission = useCallback(async () => {
        console.log('Requesting camera permission...');
        const permission = await Camera.requestCameraPermission();
        console.log(`Camera permission status: ${permission}`);

        if (permission === 'denied') await Linking.openSettings();
        setCameraPermissionStatus(permission);
    }, []);

    useEffect(() => {
        if (cameraPermissionStatus === 'authorized' && microphonePermissionStatus === 'authorized') permContext.setPermitted(true);
    }, [cameraPermissionStatus, microphonePermissionStatus, navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.welcome}>Parcetrace Admin</Text>
            <View style={styles.permissionsContainer}>
                <Text>Parcetrace Admin needs these permissions to function.</Text> 
                {cameraPermissionStatus !== 'authorized' && (
                <Text style={styles.permissionText}>
                    <Text style={styles.bold}>Camera permission</Text>.{' '}
                    <Text style={styles.hyperlink} onPress={requestCameraPermission}>
                    Grant
                    </Text>
                </Text>
                )}
                {microphonePermissionStatus !== 'authorized' && (
                <Text style={styles.permissionText}>
                    <Text style={styles.bold}>Microphone permission</Text>.{' '}
                    <Text style={styles.hyperlink} onPress={requestMicrophonePermission}>
                    Grant
                    </Text>
                </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 38,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  banner: {
    position: 'absolute',
    opacity: 0.4,
    bottom: 0,
    left: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    ...SAFE_AREA_PADDING,
  },
  permissionsContainer: {
    marginTop: CONTENT_SPACING * 2,
  },
  permissionText: {
    fontSize: 17,
  },
  hyperlink: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});