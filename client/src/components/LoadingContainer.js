import { drizzleReactHooks } from "@drizzle/react-plugin";
import React from 'react';
const { useDrizzleState } = drizzleReactHooks;


const LoadingContainer = ({children}) => {
  const drizzleStatus = useDrizzleState(state => state.drizzleStatus);

    if (drizzleStatus.initialized === false) {
        return "Loading...";
    }
    return (
        <>
            {children}
        </>
    )
}

export default LoadingContainer;