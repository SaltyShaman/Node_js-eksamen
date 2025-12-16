<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { addTask, updateTask } from "$lib/stores/taskStore.js";
  import { users, fetchUsers, initUserSocket } from "$lib/stores/userStore.js";

  import "./TaskForm.css";

  export let project;
  export let task = null;

  let title = task?.title || "";
  let description = task?.description || "";
  let assigned_to = task?.assigned_to || "";
  let status = task?.status || "todo";

  let loading = false;
  let error = "";

  // Hent brugere og init socket
  onMount(() => {
    fetchUsers();
    initUserSocket();
  });

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

    if (!$users.some(u => u.username === assigned_to)) {
      error = "Brugeren findes ikke i systemet.";
      return;
    }

    loading = true;

    try {
      if (task) {
        const data = await api(`/api/tasks/${task.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            assigned_to,
            status,
            project_id: project.id
          })
        });
        updateTask(data.task);
      } else {
        const data = await api("/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            assigned_to,
            status,
            project_id: project.id
          })
        });
        addTask(data.task);

        title = "";
        description = "";
        assigned_to = "";
        status = "todo";
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
  {#if error}
    <p style="color:red">{error}</p>
  {/if}

  <input
    type="text"
    placeholder="Titel"
    bind:value={title}
    required
  />

  <textarea
    placeholder="Beskrivelse"
    bind:value={description}
  ></textarea>

  <select bind:value={assigned_to}>
    <option value="">Vælg bruger</option>
    {#each $users as user}
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
