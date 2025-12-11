<script>
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api.js";
  import { page } from "$app/stores";
  import { connectSocket, getSocket } from "$lib/socket.js";

  let tasks = [];
  let filteredTasks = [];
  let loading = true;
  let error = "";
  let searchQuery = "";

  let userId;
  $: userId = $page.params.id;

  async function fetchMyTasks() {
    loading = true;
    try {
      const res = await api(`/api/tasks/assigned/${userId}`);
      tasks = res.tasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
      filteredTasks = tasks;
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente dine tasks";
    } finally {
      loading = false;
    }
  }

  // filtering based on search
  $: if (searchQuery.trim() === "") {
    filteredTasks = tasks;
  } else {
    filteredTasks = tasks.filter(
      t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // --- Socket integration for live updates ---
  let socket;

  onMount(() => {
    fetchMyTasks();
    socket = connectSocket();

    socket.on("task updated", (updatedTask) => {
      // update if task is assigned to the user
      if (updatedTask.assigned_to === Number(userId)) {
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          tasks[index] = updatedTask;
        } else {
          tasks.push(updatedTask);
        }
        tasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
      }
    });
  });

  onDestroy(() => {
    if (socket) {
      socket.off("task updated");
    }
  });
</script>

<h1>Mine Tasks</h1>

<input
  type="text"
  placeholder="Søg i dine tasks…"
  bind:value={searchQuery}
  style="padding:0.5rem; width:100%; max-width:400px; margin: 1rem 0;"
/>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if filteredTasks.length === 0}
  <p>Ingen tasks fundet.</p>
{:else}
  <ul>
    {#each filteredTasks as task}
      <li>
        {task.project_name}: {task.title} - {task.status}
      </li>
    {/each}
  </ul>
{/if}
