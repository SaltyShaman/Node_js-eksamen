<script>
  import { addTask, updateTask } from "$lib/stores/taskStore.js";
  import { users, fetchUsers, initUserSocket } from "$lib/stores/userStore.js";
  import { onMount } from "svelte";

  export let project;
  export let task = null;

  let title = task?.title || "";
  let description = task?.description || "";
  let assigned_to = task?.assigned_to || "";
  let status = task?.status || "todo";

  let searchQuery = "";   // Søgetekst for dropdown
  let loading = false;
  let error = "";

  // Hent brugere og start socket
  onMount(() => {
    fetchUsers();
    initUserSocket();
  });

  // Filtrer brugere baseret på søgning
  $: filteredUsers = $users.filter(u =>
    !searchQuery.trim() ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSubmit() {
    error = "";

    if (!title.trim()) {
      error = "Titel på task er påkrævet.";
      return;
    }

    if (!assigned_to.trim()) {
      error = "Du skal tilknytte en bruger til tasken.";
      return;
    }

    // --- Tjek at brugeren findes i store (via WebSocket eller fetch)
    if (!$users.some(u => u.username === assigned_to)) {
      error = "Brugeren findes ikke i systemet.";
      return;
    }

    loading = true;

    try {
      let res;
      if (task) {
        // Update eksisterende task
        res = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        const data = await res.json();
        updateTask(data.task);
      } else {
        // Opret ny task
        res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        const data = await res.json();
        addTask(data.task);

        // Reset form
        title = "";
        description = "";
        assigned_to = "";
        status = "todo";
        searchQuery = "";
      }
    } catch (err) {
      console.error(err);
      error = err.message || "Noget gik galt.";
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  {#if error}<p style="color:red">{error}</p>{/if}

  <input type="text" placeholder="Titel" bind:value={title} required />
  <textarea placeholder="Beskrivelse" bind:value={description}></textarea>

  <!-- Search input til user dropdown -->
  <input 
    type="text" 
    placeholder="Søg efter bruger..." 
    bind:value={searchQuery} 
  />

  <select bind:value={assigned_to}>
    <option value="">Vælg bruger</option>
    {#each filteredUsers as user}
      <option value={user.username}>
        {user.username} ({user.role})
      </option>
    {/each}
  </select>

  <select bind:value={status}>
    <option value="todo">Todo</option>
    <option value="in_progress">In Progress</option>
    <option value="done">Done</option>
  </select>

  <button type="submit" disabled={loading}>
    {task ? "Opdater Task" : "Opret Task"}
  </button>
</form>

<style>
  input, textarea, select {
    width: 100%;
    padding: 0.4rem;
    margin-top: 0.2rem;
    margin-bottom: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #222;
    color: white;
    border: none;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
