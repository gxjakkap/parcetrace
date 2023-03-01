# parcrtrace-native

Native mobile app for admins.

## Developing Environment Setup

### Prerequisite

1. Node.js v16 LTS

2. NPM v.^8 (included with Node.js)

3. eas-cli (`npm i -g eas-cli`)

### Setup steps

1. cd into this folder

2. run `npm install`

3. run `npx expo prebuild`

4. run `eas build -p android --profile development` to build a development app. Follow  throught with the prompts. You may need to make an [expo](https://expo.dev) account.

5. install apk on your device or emulator, then run `npm run start` to start a development server.
    - if you're using an external device, connect them with a usb cable and enable USB Debugging on your mobile phone.
    - if not, you'll need an Android emulator. Read more [here](https://docs.expo.dev/workflow/android-studio-emulator/).

### Building step

1. run `npx expo prebuild`

2. run `eas build -p android --profile production`

3. wait for the build to finish.