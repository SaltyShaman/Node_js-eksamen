<script>
    import { onMount } from "svelte";
    import { api } from "$lib/api.js";

    let projects = [];

    onMount(async () => {
        const res = await api("/api/projects");
        projects = res.projects;
    });
</script>

<h1>Alle Projekter</h1>

{#if projects.length > 0}
    {#each projects as project}
        <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <h3>Tasks:</h3>
            <ul>
                {#each project.tasks as task}
                    <li>
                        {task.title} - {task.status} 
                        {#if task.assigned_to} (Assigned to: {task.assigned_to}) {/if}
                    </li>
                {/each}
            </ul>
        </div>
    {/each}
{:else}
    <p>Ingen projekter endnu.</p>
{/if}