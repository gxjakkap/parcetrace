import { ApplicationSettings } from "@nativescript/core"
import { DeviceInfo } from "nativescript-dna-deviceinfo"
import * as camera from "@nativescript/camera"

export const check = async() => {
    console.log(ApplicationSettings.getString('sessionid'))
    console.log(await DeviceInfo.userAgent())
    console.log(camera.isAvailable())
}