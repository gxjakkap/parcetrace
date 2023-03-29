import { View, Text, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native'
import { ToastBannerProvider, ToastBannerPresenter, useToastBannerToggler, Transition } from 'react-native-toast-banner';
import { DataTable } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import React from 'react';
import * as SecureStore from 'expo-secure-store';

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Routes } from "../types/Routes";

interface dropdownItem {
    label: string,
    value: string
}

interface requestBody {
    sessionid: string,
    nameQuery?: string,
    fullNameQuery?: string,
    phoneQuery?: string
}

interface lineData {
    displayName: string,
    picLink: string
}

interface userData {
    userId: string,
    lineData: lineData,
    isRegistered: true,
    name: string,
    surname: string,
    room: string,
    phoneNumber: string
}

type Props = NativeStackScreenProps<Routes, 'ParcelAddPage'>
export default function ParcelAddPage({ navigation, route }: Props) {
    const { showBanner, hideBanner } = useToastBannerToggler()
    const { rawData, dropdownItems } = route.params

    console.log(dropdownItems)

    const [searched, setSearched] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    //dropdown
    const [dropdownItemsState, setDropdownItems] = React.useState<dropdownItem[]>(dropdownItems)
    const [typeDropdownItems, setTypeDropdownItems] = React.useState([{ label: 'เบอร์โทรศัพท์', value: 'phoneQuery'}, { label: 'ชื่อจริง', value: 'nameQuery'},{ label: 'ชื่อ-นามสกุล', value: 'fullNameQuery'}])

    const [primaryDropdownOpen, setPrimaryDropdownOpen] = React.useState(false)
    const [primaryQuery, setPrimaryQuery] = React.useState(rawData[0])

    const [primaryTypeDropdownOpen, setPrimaryTypeDropdownOpen] = React.useState(false)
    const [primaryType, setPrimaryType] = React.useState('phoneQuery')


    const [userData, setUserData] = React.useState<userData>()

    const [location, setLocation] = React.useState("")
    const [sender, setSender] = React.useState("")

    const getUser = async() => {
        setLoading(true)
        const sessionId = await SecureStore.getItemAsync('session')
        let requestBody: requestBody = { sessionid: sessionId as string}
        
        //primary query
        switch(primaryType){
            case "phoneQuery":
                requestBody.phoneQuery = primaryQuery
                break;
            case "fullNameQuery":
                requestBody.fullNameQuery = primaryQuery
                break;
            case "nameQuery":
                requestBody.nameQuery = primaryQuery
        }

        const queryRes = await fetch("https://api.guntxjakka.me/adminapp/userlookup", {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(requestBody)})
        console.log(queryRes)
        if (queryRes.status !== 200){
            setLoading(false)
            showBanner({
                contentView: <Text>Error: RequestError!</Text>,
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
            throw Error('Request Error: queryRes')
        }
        
        const body = await queryRes.json()
        const { user } = body
        setUserData(user)
        setSearched(true)
        setLoading(false)
    }

    const addParcels = async() => {
        if (location == "" || sender == ""){
            showBanner({
                contentView: <Text>Error: โปรดกรอกข้อมูลให้ครบ!</Text>,
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
        const sessionId = await SecureStore.getItemAsync('session')
        const requestBody = {
            sender: sender,
            location: location,
            userId: userData?.userId,
            sessionid: sessionId
        }
        const pAddRes = await fetch("https://api.guntxjakka.me/adminapp/parcelreg", {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(requestBody)})
        console.log(pAddRes)
        if (pAddRes.status !== 200){
            setLoading(false)
            showBanner({
                contentView: <Text>Error: RequestError!</Text>,
                backgroundColor: 'red',
                duration: 2000,
                transitions: [
                    Transition.Move,
                    Transition.MoveLinear,
                    Transition.FadeInOut,
                ]
            })
            throw Error('Request Error: pAddRes')
        }
        Alert.alert(
            'Success', 
            `เพิ่มพัสดุสำหรับ ${userData?.name} ${userData?.surname} เรียบร้อย`,
            [
                {
                    text: 'OK',
                    onPress: () => { navigation.popToTop() }
                },
            ]
        )
    }

    return (
        <View className='w-full h-full p-5'>
            {loading ? (
                <>
                    <View className='justify-center items-center'>
                        <ActivityIndicator size="large" />
                        <Text className='text-center'>Loading...</Text>
                    </View>
                </>
                
            ) : (
                <>
                    {searched ? (
                        <>
                            <Text className='text-4xl text-center'>Results</Text>
                            <DataTable className='pb-10'>
                                <DataTable.Header>
                                    <DataTable.Title><Text className='text-black'>Name</Text></DataTable.Title>
                                    <DataTable.Title><Text className='text-black'>Room</Text></DataTable.Title>
                                </DataTable.Header>
                                <DataTable.Row>
                                    <DataTable.Cell>
                                        <Text className='text-black'>{userData?.name}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell>
                                        <Text className='text-black'>{userData?.room}</Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            </DataTable>
                            <View className='py-2'>
                                <Text>ผู้ส่ง/ชื่อบริษัทขนส่ง</Text>
                                <TextInput
                                    className="h-10 border rounded-lg"
                                    value={sender}
                                    onChangeText={setSender}
                                    placeholder="  เช่น ไปรษณีย์ไทย หรือ คุณใจดี"
                                />
                            </View>
                            <View className='pb-10'>
                                <Text>จุดรับพัสดุ</Text>
                                <TextInput
                                    className="h-10 border rounded -lg"
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="  จุดรับพัสดุ เช่น ป้อมยาม"
                                />
                            </View>
                            <Pressable onPress={() => {addParcels()}}>
                                <Text className='items-center justify-center text-center text-white py-5 px-[10] border-[4] bg-green-700 rounded-lg'>
                                    Submit
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Text className='text-4xl text-center mt-3'>ค้นหาผู้ใช้</Text>
                            <View className='pt-3 pb-[50]'>
                                <Text>ข้อความ</Text>
                                <DropDownPicker
                                    open={primaryDropdownOpen}
                                    value={primaryQuery}
                                    items={dropdownItemsState}
                                    setOpen={setPrimaryDropdownOpen}
                                    setValue={setPrimaryQuery}
                                    setItems={setDropdownItems}
                                />
                            </View>
                            {primaryDropdownOpen ? (<></>) : (
                                <View className='pt-3 pb-[75]'>
                                    <Text>ประเภท</Text>
                                    <DropDownPicker
                                        open={primaryTypeDropdownOpen}
                                        value={primaryType}
                                        items={typeDropdownItems}
                                        setOpen={setPrimaryTypeDropdownOpen}
                                        setValue={setPrimaryType}
                                        setItems={setTypeDropdownItems}
                                    />
                                </View>
                            )}
                            <Pressable onPress={() => {getUser()}}>
                                <Text className='items-center justify-center text-center text-white py-5 px-[10] border-[4] bg-green-700 rounded-lg'>
                                    ค้นหาผู้ใช้
                                </Text>
                            </Pressable>
                        </>
                    )}
                </>
            )}
        </View>
    )
}