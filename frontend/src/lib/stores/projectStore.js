import { writable } from "svelte/store";
import { getSocket, connectSocket } from "$lib/socket.js";
import { api } from "$lib/api.js";

//this file will handle all sockets regarding projects

// Store for projects
export const projects = writable([]);

export async function fetchProjects() {
    try {
        const data = await api("/api/projects"); 
        projects.set(data.projects || []);
    } catch (err) {
        console.error("Kunne ikke hente projekter:", err);
    }
}


// socket listeners
export function initProjectSocket() {
    const socket = connectSocket();

    
    socket.on("projectCreated", (project) => {
        projects.update((list) => [...list, project]);
    });

    socket.on("projectUpdated", (updatedProject) => {
        projects.update((list) =>
            list.map((p) => (p.id === updatedProject.id ? updatedProject : p))
        );
    });

    socket.on("projectDeleted", ({ id }) => {
        projects.update((list) => list.filter((p) => p.id !== id));
    });
}

//to clear if needed
export function clearProjectListeners() {
    getSocket()?.removeAllListeners("projectCreated");
    getSocket()?.removeAllListeners("projectUpdated");
    getSocket()?.removeAllListeners("projectDeleted");
}
