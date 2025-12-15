import { writable } from "svelte/store";
import { api } from "$lib/api.js";
import { connectSocket, getSocket } from "$lib/socket.js";

// Store for all users
export const users = writable([]);

// 🔐sockets should only be initailized once
let socketInitialized = false;

// get backend users
export async function fetchUsers() {
  try {
    const data = await api("/api/users");
    users.set(data.users || []);
  } catch (err) {
    console.error("Kunne ikke hente brugere:", err);
  }
}

// ➕ notice the duplicate protection
export function addUser(user) {
  users.update(list => {
    if (list.some(u => u.id === user.id)) {
      return list; // 🛡️ stop duplicates
    }
    return [...list, user];
  });
}


export function updateUser(updatedUser) {
  users.update(list =>
    list.map(u => u.id === updatedUser.id ? updatedUser : u)
  );
}

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
