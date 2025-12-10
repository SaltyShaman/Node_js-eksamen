import { env } from '$env/dynamic/public';


//This file is to be used for API calls to the backend. Purpose is to avoid exposing data.

const BASE_URL = env.PUBLIC_API_URL;

export async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options
    });

    let data;
    try {
        data = await res.json();
    } catch (err) {
        throw new Error("Invalid JSON response from server");
    }

    if (!res.ok) {
        // backend error -> throw so frontend can handle it
        throw new Error(data.error || "API request failed");
    }

    return data;
}
