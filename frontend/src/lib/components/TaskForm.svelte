<script>
  import { api } from "$lib/api.js";
  import { addTask, updateTask } from "$lib/stores/taskStore.js";

  export let project;
  export let task = null;

  let title = task?.title || "";
  let description = task?.description || "";
  let assigned_to = task?.assigned_to || "";
  let status = task?.status || "todo";
  let loading = false;
  let error = "";

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
        // Update eksisterende task
        res = await api(`/api/tasks/${task.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        updateTask(res.task);  // taskStore håndterer state og socket-opdatering
      } else {
        // Opret ny task
        res = await api("/api/tasks", {
          method: "POST",
          body: JSON.stringify({ title, description, assigned_to, status, project_id: project.id })
        });
        addTask(res.task);  // taskStore håndterer state og socket-opdatering

        // Reset form
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
  {#if error}<p style="color:red">{error}</p>{/if}
  <input type="text" placeholder="Titel" bind:value={title} required />
  <textarea placeholder="Beskrivelse" bind:value={description}></textarea>
  <input type="text" placeholder="Assigned to" bind:value={assigned_to} />
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
