import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastBannerProvider, ToastBannerPresenter } from 'react-native-toast-banner';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';
import * as React from 'react';

import authState from './context/authState';
import permissionState from './context/permissionState';

import Home from './page/Home';
import WelcomePage from './page/Welcome';
import CameraPage from './page/Camera';
import MediaPage from './page/Media';
import PermissionsPage from './page/Permission';

const Stack = createNativeStackNavigator();

export default function App(): React.ReactElement | null {
  const [authenticated, setAuthenticated] = React.useState(false)
  const [cameraPermission, setCameraPermission] = React.useState<CameraPermissionStatus>();
  const [microphonePermission, setMicrophonePermission] = React.useState<CameraPermissionStatus>();

  const [permitted, setPermitted] = React.useState(false)
  console.log(permitted)

  React.useEffect(() => {
    /* Camera.getCameraPermissionStatus().then(setCameraPermission);
    Camera.getMicrophonePermissionStatus().then(setMicrophonePermission); */
    SecureStore.getItemAsync('session').then(session => {
      if (session) {
        setAuthenticated(true)
      }
    })
  }, [])

  React.useEffect(() => {
    Camera.getCameraPermissionStatus().then(camPerms => {
      Camera.getMicrophonePermissionStatus().then(micPerms => {
        if (camPerms == 'authorized' && micPerms == 'authorized'){
          setPermitted(true)
        }
        else {
          console.log('check')
          setPermitted(false)
        }
      })
    })
  }, [])


  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <authState.Provider value={{ authenticated, setAuthenticated }}>
        <permissionState.Provider value={{ permitted, setPermitted }}>
          <ToastBannerProvider>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false, statusBarStyle: 'dark', animationTypeForReplace: 'push',}}>
                {permitted ? (
                  <>
                  {authenticated ? (
                      <>
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen name='CameraPage' component={CameraPage}/>
                        <Stack.Screen name='MediaPage' component={MediaPage as any} options={{ animation: 'none', presentation: 'transparentModal',}}/>
                      </>
                    ) :
                    (
                      <>
                        <Stack.Screen name='WelcomePage' component={WelcomePage} />
                      </>
                    )
                  }
                </>
                ) 
                : <Stack.Screen name="PermissionPage" component={PermissionsPage} />}
              </Stack.Navigator>
              <ToastBannerPresenter />
            </NavigationContainer>
          </ToastBannerProvider>
        </permissionState.Provider>
      </authState.Provider>
    </GestureHandlerRootView>
  );
}


