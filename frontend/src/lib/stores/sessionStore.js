import { writable } from 'svelte/store';
import { api } from "$lib/api.js";

export const user = writable(null);
export const isAuthenticated = writable(false);
export const loadingSession = writable(true);



export async function loadSession() {

    try {
        const res = await api("/protected"); //See if user is logged in
        user.set(res.user);
        isAuthenticated.set(true);
    } catch (err) {
        user.set(null); //flag user as not logged in
        isAuthenticated.set(false);
    } finally {
        loadingSession.set(false);
    }
}

export async function login(username, password) {
    try {
        const res = await api("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });

        if (res.error) {
            return null; // login failed
        }

        user.set(res.user);
        isAuthenticated.set(true);
        return res.user;

    } catch (err) {
        return null; // network or other failure
    }
}
  
export async function logout() {
    try {
        await api("/auth/logout", { method: "POST" });
    } catch (err) {
        console.error("Logout failed:", err);
    } finally {
        user.set(null);
        isAuthenticated.set(false);
        return true;
    }
}


    
