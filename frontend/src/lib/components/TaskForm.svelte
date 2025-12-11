<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { api } from "$lib/api.js";

  export let project; // På edit-siden: projektet vi opretter task til
  export let task = null; // Hvis man vil redigere en eksisterende task

  const dispatch = createEventDispatcher();

  let title = "";
  let description = "";
  let assigned_to = "";
  let status = "todo";
  let loading = false;
  let error = "";

  onMount(() => {
    if (task) {
      title = task.title;
      description = task.description || "";
      assigned_to = task.assigned_to || "";
      status = task.status || "todo";
    }
  });

  async function handleSubmit() {
    if (!title.trim()) {
      error = "Titel på task er påkrævet.";
      return;
    }

    loading = true;
    error = "";

    try {
      let res;
      if (task) {
        // update task
        res = await api(`/api/tasks/${task.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        dispatch("updated", res.task);
      } else {
        // make new task
        res = await api("/api/tasks", {
          method: "POST",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        dispatch("created", res.task);

        // clear form
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

<form on:submit|preventDefault={handleSubmit} style="margin-bottom:1rem;">
  {#if error}
    <p style="color:red">{error}</p>
  {/if}
  <div>
    <label>Titel</label>
    <input type="text" bind:value={title} placeholder="Titel på task" required />
  </div>
  <div>
    <label>Beskrivelse</label>
    <textarea bind:value={description} placeholder="Beskrivelse"></textarea>
  </div>
  <div>
    <label>Assigned to (username)</label>
    <input type="text" bind:value={assigned_to} placeholder="Brugernavn" />
  </div>
  <div>
    <label>Status</label>
    <select bind:value={status}>
      <option value="todo">Todo</option>
      <option value="in_progress">In Progress</option>
      <option value="done">Done</option>
    </select>
  </div>
  <button type="submit" disabled={loading}>
    {task ? "Opdater Task" : "Opret Task"}
  </button>
</form>

<style>
  form div {
    margin-bottom: 0.5rem;
  }
  input, textarea, select {
    width: 100%;
    padding: 0.4rem;
    margin-top: 0.2rem;
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
