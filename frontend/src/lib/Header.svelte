<script>
    import { user, logout } from "$lib/stores/sessionStore.js";
    import { goto } from "$app/navigation";

    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    async function handleLogout() {
        await logout();
        goto("/login");
    }

    function goToStaffTasks() {
        if ($user.role === "STAFF") {
            goto(`/tasks/staff/${$user.id}`);
        } else {
            goto("/tasks/staff");
        }
    }
</script>

<header>
    <nav class="navbar">
        <div class="logo">Eksamen Project</div>
        <ul>
            {#if $user}
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/projects">Projekter</a></li>
                {#if $user.role === 'ADMIN' || $user.role === 'TEAM_LEADER'}
                    <li><a href="/projects/create">Opret Projekt</a></li>
                    <li><a href="/users">Brugere</a></li>
                {/if}
                <li><button on:click={goToStaffTasks}>Tasks per Staff</button></li>
                <li class="user-info">{$user.username} ({$user.role})</li>
                <li><button class="logout-button" on:click={handleLogout}>Logout</button></li>
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
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
    }

    .logo {
        font-weight: bold;
        font-size: 1.6rem;
    }

    ul {
        list-style: none;
        display: flex;
        gap: 1.5rem;
        align-items: center;
        margin: 0;
        padding: 0;
    }

    li {
        position: relative;
    }

    a, button {
        color: white;
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 1rem;
        transition: all 0.2s ease-in-out;
    }

    /* Hover effekter */
    a:hover, button:hover {
        background: #444;
        color: #ffcc00;
        transform: scale(1.05);
    }

    .user-info {
        font-style: italic;
        padding: 0.5rem 1rem;
    }

    .logout-button {
        background: #ff4444;
        border-radius: 4px;
    }

    .logout-button:hover {
        background: #ff0000;
        color: white;
        transform: scale(1.05);
    }
</style>
