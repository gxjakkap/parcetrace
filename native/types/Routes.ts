interface dropdownItem {
    label: string,
    value: string
}

export type Routes = {
    WelcomePage: {} | undefined,
    Home: {} | undefined,
    CameraPage: {} | undefined,
    PermissionPage: {} | undefined,
    DebugPage: {} | undefined,
    MediaPage:  {
        path: string,
        type: 'video'|'photo'
    }
    OCRPage: {
        path: string
    }
    ParcelAddPage: {
        rawData: string[],
        dropdownItems: dropdownItem[],
    }
}