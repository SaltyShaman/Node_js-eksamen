<script>
    import { login, isAuthenticated, loadingSession, user } from "$lib/stores/sessionStore.js";
    import { onMount } from "svelte";

    let username = "";
    let password = "";
    let errorMessage = "";

    // Redirect hvis allerede logget ind
    onMount(() => {
        if (!$loadingSession && $isAuthenticated) {
            redirectByRole($user.role, $user.id);
        }
    });

    async function handleLogin(e) {
        e.preventDefault();
        errorMessage = "";

        const loggedInUser = await login(username, password);

        if (!loggedInUser) {
            errorMessage = "Invalid username or password";
            return;
        }

        redirectByRole(loggedInUser.role, loggedInUser.id);
    }

    function redirectByRole(role, id) {
        if (role === "STAFF") {
            window.location.href = `/tasks/staff/${id}`;
        } else if (role === "TEAM_LEADER") {
            window.location.href = "/tasks/staff"; // liste over staff
        } else if (role === "ADMIN") {
            window.location.href = "/users"; // admin-side
        } else {
            window.location.href = "/dashboard"; // fallback
        }
    }
</script>

<main>
    <h1>Login</h1>
    <form on:submit={handleLogin}>
        <div>
            <label for="username">Username:</label>
            <input id="username" bind:value={username} required />
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" bind:value={password} required />
        </div>
        {#if errorMessage}
            <p style="color:red">{errorMessage}</p>
        {/if}
        <button type="submit">Login</button>
    </form>
</main>

<style>
    main {
        max-width: 400px;
        margin: 4rem auto;
        padding: 2rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        text-align: center;
    }
    input {
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.5rem;
    }
</style>

