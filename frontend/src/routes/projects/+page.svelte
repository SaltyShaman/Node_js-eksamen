<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";

  let projects = [];
  let loading = true;
  let error = "";

  async function fetchProjects() {
    loading = true;
    try {
      const res = await api("/api/projects");
      projects = res.projects;
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente projekter";
    } finally {
      loading = false;
    }
  }

  function handleEdit(projectId) {
    goto(`/projects/edit/${projectId}`);
  }

  async function handleDelete(projectId) {
    if (!confirm("Er du sikker på, at du vil slette dette projekt?")) return;

    try {
      await api(`/api/projects/${projectId}`, { method: "DELETE" });
      // Fjern projektet fra listen lokalt
      projects = projects.filter(p => p.id !== projectId);
    } catch (err) {
      console.error(err);
      alert("Kunne ikke slette projektet");
    }
  }

  onMount(() => {
    fetchProjects();
  });
</script>

<h1>Alle Projekter</h1>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if projects.length === 0}
  <p>Ingen projekter endnu.</p>
{:else}
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
      <button on:click={() => handleEdit(project.id)}>Rediger</button>
      <button on:click={() => handleDelete(project.id)}>Slet</button>
    </div>
  {/each}
{/if}
