<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";

  let staffTasks = [];
  let loading = true;
  let error = "";

// Fetch staff and tasks from backend
async function fetchStaffTasks() {
  loading = true;
  try {
    const res = await api("/api/tasks/staff"); 
    // Sort by project
    staffTasks = res.staffTasks.map(staff => ({
      ...staff,
      tasks: staff.tasks.sort((a, b) => a.project_name.localeCompare(b.project_name))
    }));
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
{:else if staffTasks.length === 0}
  <p>Ingen staff fundet.</p>
{:else}
  {#each staffTasks as staff}
    <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
      <h2>{staff.username}</h2>
      {#if staff.tasks.length === 0}
        <p>Ingen tasks tildelt</p>
      {:else}
        <ul>
          {#each staff.tasks as task}
            <li>
              {task.project_name}: {task.title} - {task.status}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/each}
{/if}
