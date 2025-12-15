<script>
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { tasks, initTaskSocket, clearTaskListeners } from "$lib/stores/taskStore.js";
  import { api } from "$lib/api.js";

  let userId;
  $: userId = $page.params.id;

  let myTasks = [];
  let filteredTasks = [];
  let loading = true;
  let error = "";
  let searchQuery = "";

  // Subscribe to taskStore for live updates
  const unsubscribe = tasks.subscribe(list => {
    myTasks = list
      .filter(t => t.assigned_to === Number(userId))
      .sort((a, b) => a.project_name.localeCompare(b.project_name));
    filteredTasks = filterTasks(myTasks, searchQuery);
  });

  function filterTasks(taskList, query) {
    if (!query.trim()) return [...taskList];
    const q = query.toLowerCase();
    return taskList.filter(
      t => t.title.toLowerCase().includes(q) || t.project_name.toLowerCase().includes(q)
    );
  }

  //Get tasks for current user (used for staff role)
  async function fetchMyTasks() {
    loading = true;
    try {
      const res = await api(`/api/tasks/assigned/${userId}`);
      if (!res?.tasks) {
        error = "Kunne ikke hente dine tasks";
        return;
      }

      // Push to taskStore → triggerer live update via subscription
      const flatTasks = res.tasks.map(t => ({
        ...t,
        assigned_to_name: t.assigned_to_name || "Ukjent"
      }));
      tasks.set(flatTasks);

    } catch (err) {
      console.error(err);
      error = "Fejl ved hentning af tasks";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchMyTasks();
    try {
      initTaskSocket(); // start WebSocket-listerner
    } catch (err) {
      console.error("Kunne ikke initialisere sockets:", err);
      error = "Noget gik galt med websocket.";
    }
  });

  $: filteredTasks = filterTasks(myTasks, searchQuery);

  onDestroy(() => {
    clearTaskListeners();
    unsubscribe();
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
  <p>Indlæser...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if filteredTasks.length === 0}
  <p>Ingen tasks fundet.</p>
{:else}
  <ul>
    {#each filteredTasks as task}
      <li>
        {task.project_name}: {task.title} — {task.status}
      </li>
    {/each}
  </ul>
{/if}
