import { io } from "socket.io-client";
import { isAuthenticated } from "./sessionStore.js";

let socket = null;

export function getSocket() {
    return socket;
}


export function connectSocket() {

    if (socket) return socket; //if there already is a socket

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080", { //get the socket from the .env file
        withCredentials: true
    });

        socket.on("connect", () => {
        console.log("Connected to Socket.IO:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

//connect socket when logging in:
isAuthenticated.subscribe((auth) => {
    if (auth) {
        connectSocket();
    } else {
        disconnectSocket();
    }
});