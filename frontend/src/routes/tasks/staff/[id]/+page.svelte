<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";

  let staffTasks = [];
  let loading = true;
  let error = "";

  async function fetchStaffTasks() {
    loading = true;
    try {
      
      const res = await api("/api/tasks/staff"); 
      staffTasks = res.staffTasks;
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente tasks for staff";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchStaffTasks();
  });
</script>

<h1>Tasks per Staff</h1>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else}
  {#each staffTasks as staff}
    <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
      <h2>{staff.username}</h2>
      <ul>
        {#each staff.tasks as task}
          <li>{task.title} - {task.status} (Projekt: {task.project_name})</li>
        {/each}
      </ul>
    </div>
  {/each}
{/if}
