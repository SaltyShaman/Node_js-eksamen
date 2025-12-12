import { writable } from "svelte/store";
import { getSocket, connectSocket } from "$lib/socket.js";
import { api } from "$lib/api.js";


// Store for projekter
export const projects = writable([]);

export async function fetchProjects() {
    try {
        const data = await api("/api/projects"); // tilføj /api her
        projects.set(data.projects || []);
    } catch (err) {
        console.error("Kunne ikke hente projekter:", err);
    }
}


// Funktion til at starte socket-lytter
export function initProjectSocket() {
    const socket = connectSocket();

    // Når et projekt oprettes
    socket.on("projectCreated", (project) => {
        projects.update((list) => [...list, project]);
    });

    // Når et projekt opdateres
    socket.on("projectUpdated", (updatedProject) => {
        projects.update((list) =>
            list.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
    });

    // Når et projekt slettes
    socket.on("projectDeleted", ({ id }) => {
        projects.update((list) => list.filter((p) => p.id !== id));
    });
}

// Funktion til at rydde listeners (valgfrit)
export function clearProjectListeners() {
    getSocket()?.removeAllListeners("projectCreated");
    getSocket()?.removeAllListeners("projectUpdated");
    getSocket()?.removeAllListeners("projectDeleted");
}
