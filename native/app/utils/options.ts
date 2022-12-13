import { OptionsCommon, Mode } from "@nstudio/nativescript-loading-indicator"

export const loadingModalOptions: OptionsCommon = {
    message: "กำลังโหลด...",
    userInteractionEnabled: false,
    dimBackground: true,
    mode: Mode.Determinate,
}