import { io } from "socket.io-client";
import { isAuthenticated } from "$lib/stores/sessionStore.js";

let socket = null;

export function getSocket() {
    return socket;
}

export function connectSocket() {
    if (socket) return socket;

    // Backend URL, sender cookies til session
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080", {
        withCredentials: true,
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.log("Connected to Socket.IO:", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

