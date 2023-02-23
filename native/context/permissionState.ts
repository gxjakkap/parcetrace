import * as React from 'react';

const permissionState = React.createContext({
    permitted: false,
    setPermitted: (state: boolean) => {}
})

export default permissionState