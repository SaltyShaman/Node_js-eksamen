import { io } from "socket.io-client";
import { isAuthenticated } from "$lib/stores/sessionStore.js";

let socket = null;

// --- Get current socket ---
export function getSocket() {
    return socket;
}

// --- Connect socket ---
export function connectSocket() {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080", {
        withCredentials: true,
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    return socket;
}

// --- Disconnect socket ---
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// --- Subscribe to project events ---
export function onProjectCreated(callback) {
    socket?.on("projectCreated", callback);
}

export function onProjectUpdated(callback) {
    socket?.on("projectUpdated", callback);
}

export function onProjectDeleted(callback) {
    socket?.on("projectDeleted", callback);
}

// --- Subscribe to task events ---
export function onTaskCreated(callback) {
    socket?.on("taskCreated", callback);
}

export function onTaskUpdated(callback) {
    socket?.on("taskUpdated", callback);
}

export function onTaskDeleted(callback) {
    socket?.on("taskDeleted", callback);
}

// --- Optional: unsubscribe all listeners ---
export function clearListeners() {
    socket?.removeAllListeners("projectCreated");
    socket?.removeAllListeners("projectUpdated");
    socket?.removeAllListeners("projectDeleted");
    socket?.removeAllListeners("taskCreated");
    socket?.removeAllListeners("taskUpdated");
    socket?.removeAllListeners("taskDeleted");
}

