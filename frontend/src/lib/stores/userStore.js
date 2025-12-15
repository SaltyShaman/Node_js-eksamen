import { writable } from "svelte/store";
import { api } from "$lib/api.js";
import { connectSocket, getSocket } from "$lib/socket.js";

// Store for alle brugere
export const users = writable([]);

// 🔐 Sørger for at socket kun initieres ÉN gang
let socketInitialized = false;

// Hent brugere fra backend
export async function fetchUsers() {
  try {
    const data = await api("/api/users");
    users.set(data.users || []);
  } catch (err) {
    console.error("Kunne ikke hente brugere:", err);
  }
}

// ➕ Tilføj bruger (med duplicate-beskyttelse)
export function addUser(user) {
  users.update(list => {
    if (list.some(u => u.id === user.id)) {
      return list; // 🛡️ stop duplicates
    }
    return [...list, user];
  });
}

// 🔄 Opdater bruger
export function updateUser(updatedUser) {
  users.update(list =>
    list.map(u => u.id === updatedUser.id ? updatedUser : u)
  );
}

// ❌ Fjern bruger
export function removeUser(userId) {
  users.update(list => list.filter(u => u.id !== userId));
}

// 🔌 Initialiser socket-listeners (IDEMPOTENT)
export function initUserSocket() {
  if (socketInitialized) return;
  socketInitialized = true;

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

// 🧹 Ryd socket-listeners (kun hvis nødvendigt)
export function clearUserListeners() {
  const socket = getSocket();
  if (!socket) return;

  socket.removeAllListeners("userCreated");
  socket.removeAllListeners("userUpdated");
  socket.removeAllListeners("userDeleted");

  socketInitialized = false;
}
