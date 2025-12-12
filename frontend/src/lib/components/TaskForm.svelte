<script>
  import { api } from "$lib/api.js";
  import { addTask, updateTask } from "$lib/stores/taskStore.js";
  import { onMount } from "svelte";

  export let project;
  export let task = null;

  let title = task?.title || "";
  let description = task?.description || "";
  let assigned_to = task?.assigned_to || "";
  let status = task?.status || "todo";

  let users = [];        // Alle brugere fra backend
  let filteredUsers = []; // Brugere der matches af søgning
  let searchQuery = "";   // Søgetekst for dropdown

  let loading = false;
  let error = "";

  // Hent brugere ved mount
  onMount(async () => {
    try {
      const data = await api("/api/users");
      users = data.users || [];
      filteredUsers = users;
    } catch (err) {
      console.error("Kunne ikke hente brugere:", err);
      error = "Fejl ved hentning af brugere";
    }
  });

  // Filtrering baseret på søgning
  $: filteredUsers = users.filter(u => 
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
      error = "Du skal tilknytte en bruger fra databasen til tasken.";
      return;
    }

    // --- Validering af bruger
    const userExists = users.some(u => u.username === assigned_to);
    if (!userExists) {
      error = "❌ Brugeren findes ikke i systemet.";
      return;
    }

    loading = true;
    try {
      let res;
      if (task) {
        // Update eksisterende task
        res = await api(`/api/tasks/${task.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        updateTask(res.task);
      } else {
        // Opret ny task
        res = await api("/api/tasks", {
          method: "POST",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        addTask(res.task);

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
