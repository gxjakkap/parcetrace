import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import * as SecureStore from 'expo-secure-store';
import * as React from 'react';

import authenticateContext from '../context/authState';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'

type Props = NativeStackScreenProps<Routes, 'DebugPage'>

export default function DebugPage ({ navigation }: Props){
    const loggedInContext = React.useContext(authenticateContext)
    const { showBanner, hideBanner } = useToastBannerToggler()

    const errorText = (errorMsg: string) => {
        return (
            <Text>{errorMsg}</Text>
        )
    }

    const forceLogout = async() => {
        const sessionId = await SecureStore.getItemAsync('session')
        await SecureStore.deleteItemAsync('session')
        showBanner({
            contentView: <Text>Logged out!</Text>,
            backgroundColor: 'green',
            duration: 2000,
            transitions: [
                Transition.Move,
                Transition.MoveLinear,
                Transition.FadeInOut,
            ]
        })
        loggedInContext.setAuthenticated(false)
    }

    const forceLogoutAlert = () => {        
        Alert.alert(
            'Force Logout', 
            'Are you sure you want to force logout (remove local session)? This does not remove the current session from the server and should be use when the local session doesn&apos;t exist on the server only.',
            [
                {
                    text: 'OK',
                    onPress: () => forceLogout()
                },
                {
                    text: 'Cancle',
                    onPress: () => {}
                }
            ]
            )
    }

    return (
        <View className="flex-1 bg-white justify-center px-10">
            <Text className="text-xl text-center">Home Page</Text>
            <Button 
                title="Force Logout"
                onPress={() => {
                    forceLogoutAlert()
                }}
            
            />
        </View>
    )
}