<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";

  let staffTasks = [];
  let filteredStaffTasks = [];
  let loading = true;
  let error = "";
  let searchQuery = "";

  // Fetch staff and tasks from backend
  async function fetchStaffTasks() {
    loading = true;
    try {
      const res = await api("/api/tasks/staff"); 
      staffTasks = res.staffTasks.map(staff => ({
        ...staff,
        tasks: staff.tasks.sort((a, b) => a.project_name.localeCompare(b.project_name))
      }));
      filteredStaffTasks = staffTasks; // init
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente tasks for staff";
    } finally {
      loading = false;
    }
  }

  // Search filtering
  $: if (searchQuery.trim() === "") {
    filteredStaffTasks = staffTasks;
  } else {
    const query = searchQuery.toLowerCase();
    filteredStaffTasks = staffTasks
      .map(staff => ({
        ...staff,
        tasks: staff.tasks.filter(
          t => t.title.toLowerCase().includes(query) ||
               t.project_name.toLowerCase().includes(query)
        )
      }))
      .filter(staff => 
        staff.tasks.length > 0 || staff.username.toLowerCase().includes(query)
      );
  }

  onMount(() => {
    fetchStaffTasks();
  });
</script>

<h1>Tasks per Staff</h1>

<input 
  type="text" 
  placeholder="Søg efter staff, projekt eller task…" 
  bind:value={searchQuery} 
  style="padding:0.5rem; width:100%; max-width:400px; margin: 1rem 0;"
/>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if filteredStaffTasks.length === 0}
  <p>Ingen staff eller tasks fundet.</p>
{:else}
  {#each filteredStaffTasks as staff}
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
