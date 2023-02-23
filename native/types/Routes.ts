export type Routes = {
    WelcomePage: {} | undefined,
    Home: {} | undefined,
    CameraPage: {} | undefined,
    PermissionPage: {} | undefined,
    MediaPage:  {
        path: string,
        type: 'video'|'photo'
    }
}