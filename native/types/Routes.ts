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
    OCRTestPage: {
        path: string
    }
}