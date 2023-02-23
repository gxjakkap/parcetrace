import * as React from 'react';

const authState = React.createContext({
    authenticated: false,
    setAuthenticated: (state: boolean) => {}
})

export default authState