<script>
  import { tasks } from "$lib/stores/taskStore.js";

  export let onEdit = null;

  async function deleteTask(taskId) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kunne ikke slette task");
    } catch (err) {
      console.error("Fejl ved sletning af task:", err);
    }
  }
</script>

<ul>
  {#each $tasks as task}
    <li>
      <strong>{task.title}</strong> - {task.status} - {task.assigned_to_name || "Ingen"}
      <button on:click={() => onEdit?.(task)}>Edit</button>
      <button on:click={() => deleteTask(task.id)}>Delete</button>
    </li>
  {/each}
</ul>
