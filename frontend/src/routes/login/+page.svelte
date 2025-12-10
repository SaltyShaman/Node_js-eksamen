<script>
    import { login, isAuthenticated, loadingSession } from "$lib/stores/sessionStore.js";
    import { onMount } from "svelte";

    let username = "";
    let password = "";
    let errorMessage = "";

    //if user is logged in then redirect
    onMount(() => {
        if (!$loadingSession && $isAuthenticated) {
            window.location.href = "/dashboard";
        }
    });

    async function handleLogin(e) {
        e.preventDefault();
        errorMessage = "";

        const res = await login(username, password);
        
        if (!res) {
            errorMessage = "Invalid username or password";
            return;
        }

        window.location.href = "/dashboard";
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



