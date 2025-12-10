<script>
    import { user, logout } from "$lib/stores/sessionStore.js";

    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    async function handleLogout() {
        await logout();
        window.location.href = "/login";
    }
</script>

<header>
    <nav class="navbar">
        <div class="logo">Eksamen Project</div>
        <button class="menu-button" on:click={toggleMenu}>☰</button>
        <ul class:open={menuOpen}>
            {#if $user}
                <!-- Rollebaseret navigation -->
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/projects">Projekter</a></li>
                {#if $user.role === 'ADMIN' || $user.role === 'TEAM_LEADER'}
                    <li><a href="/projects/create">Opret Projekter</a></li>
                    <li><a href="/tasks">Opret/Administrer Tasks</a></li>
                {/if}
                
                <li>{$user.username} ({$user.role})</li>
                <li><button on:click={handleLogout}>Logout</button></li>
            {/if}
            {#if !$user}
                <li><a href="/login">Login</a></li>
            {/if}
        </ul>
    </nav>
</header>

<style>
    header {
        background: #222;
        color: white;
        padding: 1rem;
        text-align: center;
    }
    .navbar ul {
        list-style: none;
        display: flex;
        gap: 1rem;
        align-items: center;
        justify-content: center;
    }
    .navbar ul.open {
        display: block;
    }
    .navbar a {
        color: white;
        text-decoration: none;
    }
    .menu-button {
        display: none; /* make responsive later*/
    }
</style>
