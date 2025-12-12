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
            // For ADMIN/TEAM_LEADER: fx redirect til side med liste over alle staff
            goto("/tasks/staff");
        }
    }
</script>

<header>
    <nav class="navbar">
        <div class="logo">Eksamen Project</div>
        <button class="menu-button" on:click={toggleMenu}>☰</button>
        <ul class:open={menuOpen}>
            {#if $user}
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/projects">Projekter</a></li>
                {#if $user.role === 'ADMIN' || $user.role === 'TEAM_LEADER'}
                    <li><a href="/projects/create">Opret Projekt</a></li>
                    <li><a href="/users">Brugere</a></li>
                {/if}

                <li><button on:click={goToStaffTasks}>Tasks per Staff</button></li>

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
    header { background: #222; color: white; padding: 1rem; text-align: center; }
    .navbar ul { list-style: none; display: flex; gap: 1rem; align-items: center; justify-content: center; }
    .navbar ul.open { display: block; }
    .navbar a, .navbar button { color: white; text-decoration: none; background: none; border: none; cursor: pointer; }
    .menu-button { display: none; }
</style>
