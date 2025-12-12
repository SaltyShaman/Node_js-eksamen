import { writable } from "svelte/store";
import { api } from "$lib/api.js";
import { connectSocket, getSocket } from "$lib/socket.js";

// Store for alle brugere
export const users = writable([]);

// Hent brugere fra backend
export async function fetchUsers() {
  try {
    const data = await api("/api/users");
    users.set(data.users || []);
  } catch (err) {
    console.error("Kunne ikke hente brugere:", err);
  }
}

// Tilføj bruger til store (fx efter oprettelse)
export function addUser(user) {
  users.update(list => [...list, user]);
}

// Opdater bruger i store
export function updateUser(updatedUser) {
  users.update(list => list.map(u => u.id === updatedUser.id ? updatedUser : u));
}

// Fjern bruger fra store
export function removeUser(userId) {
  users.update(list => list.filter(u => u.id !== userId));
}

// Initialiser socket-lister til brugere
export function initUserSocket() {
  const socket = connectSocket();

  socket.on("userCreated", (user) => {
    addUser(user);
  });

  socket.on("userUpdated", (updatedUser) => {
    updateUser(updatedUser);
  });

  socket.on("userDeleted", ({ id }) => {
    removeUser(id);
  });
}

// Ryd socket-listeners (valgfrit)
export function clearUserListeners() {
  const socket = getSocket();
  if (!socket) return;

  socket.removeAllListeners("userCreated");
  socket.removeAllListeners("userUpdated");
  socket.removeAllListeners("userDeleted");
}
