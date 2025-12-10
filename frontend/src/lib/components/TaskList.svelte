<script>
  import { createEventDispatcher } from "svelte";
  import { api } from "$lib/api.js";

  export let tasks = [];
  const dispatch = createEventDispatcher();

  async function deleteTask(taskId) {
    await api(`/api/tasks/${taskId}`, { method: "DELETE" });
    dispatch("deleted", taskId);
  }

  async function toggleStatus(task) {
    const newStatus = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    const res = await api(`/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: newStatus })
    });
    dispatch("updated", res.task);
  }
</script>

<ul>
  {#each tasks as t}
    <li>
      <strong>{t.title}</strong> - {t.status} 
      {#if t.description} ({t.description}) {/if}
      <button on:click={() => toggleStatus(t)}>Next Status</button>
      <button on:click={() => deleteTask(t.id)}>Delete</button>
    </li>
  {/each}
</ul>
