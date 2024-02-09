import React, { createContext, useMemo } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";
const SocketContext = createContext(null);

export const useSocket = () => {
    return React.useContext(SocketContext);
}


export const SocketProvider = (props) => {
    const socket = useMemo(
        () => io(BACKEND_URL)
        , []);
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}