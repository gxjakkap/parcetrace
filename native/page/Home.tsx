import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import * as SecureStore from 'expo-secure-store';
import * as React from 'react';

import authenticateContext from '../context/authState';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'

type Props = NativeStackScreenProps<Routes, 'Home'>

export default function Home ({ navigation }: Props){
    const loggedInContext = React.useContext(authenticateContext)
    const { showBanner, hideBanner } = useToastBannerToggler()

    const errorText = (errorMsg: string) => {
        return (
            <Text>{errorMsg}</Text>
        )
    }

    const revoke = async (sessionId: string) => {
        try {
            const res = await fetch(
                'https://api.guntxjakka.me/adminapp/logout',
                {
                    body: JSON.stringify({ sessionid: sessionId }),
                    headers: { "Content-Type": "application/json" },
                    method: 'POST'
                });
            if (res.status !== 200){
                console.log(res.text)
                throw Error('API Response Error')
            }
            return res.status
        } 
        catch (error: any) {
            console.log(error)
            showBanner({
                contentView: errorText(error),
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
        }
    }

    const logout = async () => {
        const sessionId = await SecureStore.getItemAsync('session')
        const rev = await revoke(sessionId as string)
        if (rev !== 200){
            console.log('API Response Error')
            return
        }
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

    return (
        <View className="flex-1 bg-white justify-center px-10">
            <Text className="text-xl text-center">Home Page</Text>
            <Button 
                title="Add Parcel"
                onPress={() => {
                   navigation.navigate("CameraPage")
                }}
            
            />
            <Button 
                title="Debug Page"
                onPress={() => {
                   navigation.navigate("DebugPage")
                }}
            
            />
            <Button 
                title="Logout"
                onPress={() => {
                    logout()
                }}
            
            />
        </View>
    )
}