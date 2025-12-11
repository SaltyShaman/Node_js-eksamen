<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { page } from "$app/stores";

  let tasks = [];
  let loading = true;
  let error = "";

  let userId;
  $: userId = $page.params.id;

  async function fetchMyTasks() {
    loading = true;
    try {
      const res = await api(`/api/tasks/assigned/${userId}`);
      tasks = res.tasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente dine tasks";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchMyTasks();
  });
</script>

<h1>Mine Tasks</h1>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if tasks.length === 0}
  <p>Ingen tasks tildelt dig.</p>
{:else}
  <ul>
    {#each tasks as task}
      <li>
        {task.project_name}: {task.title} - {task.status}
      </li>
    {/each}
  </ul>
{/if}
