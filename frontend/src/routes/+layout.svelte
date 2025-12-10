<script>
    import { loadSession, loadingSession } from "$lib/stores/sessionStore.js";
    import Header from "$lib/Header.svelte";
    import Footer from "$lib/Footer.svelte";

    loadSession(); // load upon app start
</script>

<Header />

<main>
    {#if $loadingSession}
        <p>Loading...</p>
    {:else}
        <slot />
    {/if}
</main>

<Footer />

<style>
    main {
        padding: 2rem;
        min-height: 70vh;
    }
</style>
