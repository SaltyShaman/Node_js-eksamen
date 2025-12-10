import { api } from "$lib/api.js";

export async function load() {
    try {
        const res = await api("/protected");
        return { user: res.user };
    } catch {
        return { user: null };
    }
}