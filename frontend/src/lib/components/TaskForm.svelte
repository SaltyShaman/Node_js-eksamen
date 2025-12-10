<script>
  import { createEventDispatcher } from "svelte";
  import { api } from "$lib/api.js";

  export let projects = [];
  let title = "";
  let description = "";
  let projectId = null;

  const dispatch = createEventDispatcher();

  async function handleSubmit() {
    if (!title || !projectId) return alert("Title and project required");

    const res = await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description, project_id: projectId })
    });

    dispatch("created", res.task);

    title = "";
    description = "";
    projectId = null;
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <label>Project:</label>
  <select bind:value={projectId}>
    <option value="" disabled>Select project</option>
    {#each projects as p}
      <option value={p.id}>{p.name}</option>
    {/each}
  </select>

  <label>Title:</label>
  <input type="text" bind:value={title} />

  <label>Description:</label>
  <textarea bind:value={description}></textarea>

  <button type="submit">Opret Task</button>
</form>
