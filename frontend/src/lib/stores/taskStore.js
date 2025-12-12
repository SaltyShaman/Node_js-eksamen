import { writable } from "svelte/store";
import { getSocket, connectSocket } from "$lib/socket.js";
import { api } from "$lib/api.js";


// Store for tasks
export const tasks = writable([]);


export function addTask(task) {
    tasks.update(list => [...list, task]);
}

export async function fetchTasks() {
    if (typeof window === "undefined") return; // SSR-safe
    try {
        const data = await api("/api/tasks");
        tasks.set(data.tasks || []);
    } catch (err) {
        console.error("Kunne ikke hente tasks:", err);
    }
}


// Opdater task
export function updateTask(updatedTask) {
    tasks.update(list => list.map(t => t.id === updatedTask.id ? updatedTask : t));
}



// Funktion til at starte socket-lytter
export function initTaskSocket() {
    const socket = connectSocket();

    socket.on("taskCreated", (task) => {
        tasks.update((list) => [...list, task]);
    });

    socket.on("taskUpdated", (updatedTask) => {
        tasks.update((list) =>
            list.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
    });

    socket.on("taskDeleted", ({ id }) => {
        tasks.update((list) => list.filter((t) => t.id !== id));
    });
}

// Funktion til at rydde listeners (valgfrit)
export function clearTaskListeners() {
    getSocket()?.removeAllListeners("taskCreated");
    getSocket()?.removeAllListeners("taskUpdated");
    getSocket()?.removeAllListeners("taskDeleted");
}
