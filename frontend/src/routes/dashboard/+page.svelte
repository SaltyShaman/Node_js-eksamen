<script>
    export let data;
</script>

<h1>Dashboard</h1>
{#if data.user}
    <p>Velkommen, {data.user.username}</p>
{:else}
    <p>Du er ikke logget ind</p>
{/if}
