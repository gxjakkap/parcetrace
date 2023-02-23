import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import * as React from 'react';

import authenticateContext from '../context/authState';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from '../types/Routes'

type Props = NativeStackScreenProps<Routes, 'WelcomePage'>

export default function WelcomePage ({navigation}: Props){
    const { showBanner, hideBanner } = useToastBannerToggler()

    const loggedInContext = React.useContext(authenticateContext)

    const setLoggedIn = (sessionId: string) => {
        console.log(sessionId)
        SecureStore.setItemAsync('session', sessionId)
            .then(() => {
                loggedInContext.setAuthenticated(true)
            })
            .catch(error => {
                throw Error(error ? error : 'Set Login State Error')
            })
    }

    const errorText = (errorMsg: string) => {
        return (
            <Text>{errorMsg}</Text>
        )
    }

    const authenticate = async (password: string) => {
        try {
            const res = await fetch(
                'https://api.guntxjakka.me/adminapp/authen',
                {
                    body: JSON.stringify({ password: password, userAgent: "React Native" }),
                    headers: { "Content-Type": "application/json" },
                    method: 'POST'
                });
            const json = await res.json();
            console.log(JSON.stringify(json))
            if (res.status !== 200){
                console.log(res.text)
                throw Error(json.message)
            }
            return json;
        } 
        catch (error: any) {
            console.log(error)
            showBanner({
                contentView: errorText(error.toString()),
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

    const onFormSubmit = () => {
        authenticate(password).then(res => {
            console.log(res.sessionid)
            try {
                setLoggedIn(res.sessionid)
                showBanner({
                    contentView: <Text>Logged in!</Text>,
                    backgroundColor: 'green',
                    duration: 2000,
                    transitions: [
                        Transition.Move,
                        Transition.MoveLinear,
                        Transition.FadeInOut,
                    ]
                })
            }
            catch (error) {
                console.log(error)
                showBanner({
                    contentView: errorText('Unknown Error'),
                    backgroundColor: 'red',
                    duration: 2000,
                    transitions: [
                        Transition.Move,
                        Transition.MoveLinear,
                        Transition.FadeInOut,
                    ]
                })
            }
        })
    }

    const [password, setPasswordValue] = React.useState('')

    return (
        <View className="flex-1 bg-white justify-center px-10">
            <Text className="text-4xl text-center">Parcetrace Admin</Text>
            <Text className="text-lg">Please enter Parcetrace's admin master password.</Text>
            <TextInput
                className="h-10 my-12 border"
                value={password}
                onChangeText={setPasswordValue}
                placeholder="Enter master password here"
                textContentType="password"
                onSubmitEditing={() => onFormSubmit()}
            />
            <Button 
                onPress={() => onFormSubmit()}
                title="Enter"
            />
            <StatusBar style="auto" />
        </View>
    )
}