<script>
    import { loadSession, loadingSession, logout, user } from "$lib/stores/sessionStore.js";

    loadSession(); // loader session ved app load

    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    async function handleLogout() {
        await logout();
        // Redirect til login
        window.location.href = "/login";
    }
</script>

<header>
    <nav class="navbar">
        <div class="logo">Eksamen Project</div>
        <button class="menu-button" on:click={toggleMenu}>☰</button>
        <ul class:open={menuOpen}>
            {#if $user}
                <li>{$user.username} ({$user.role})</li>
                <li><button on:click={handleLogout}>Logout</button></li>
            {/if}
        </ul>
    </nav>
</header>

<main>
    {#if $loadingSession}
        <p>Loading...</p>
    {:else}
        <slot />
    {/if}
</main>

<footer>
    <p>&copy; 2025 Kristoffer Gillesberg</p>
</footer>

<style>
    header, footer {
        background: #222;
        color: white;
        padding: 1rem;
        text-align: center;
    }
    main {
        padding: 2rem;
        min-height: 70vh;
    }
    .navbar ul {
        list-style: none;
        display: flex;
        gap: 1rem;
    }
    .navbar ul.open {
        display: block;
    }
</style>
