<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import ProjectForm from "$lib/components/ProjectForm.svelte";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  let project = null;
  let loading = true;
  let error = "";
  let tasks = [];

  let id;
  $: id = $page.params.id;

  // Hent projekt og tasks
  onMount(async () => {
    try {
      const res = await api(`/api/projects/${id}`);
      project = res.project;
      tasks = project.tasks || [];
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente projekt";
    } finally {
      loading = false;
    }
  });

  function handleUpdated(updatedProject) {
    goto("/projects");
  }

  function handleTaskCreated(newTask) {
    tasks = [...tasks, newTask];
  }

  function handleTaskUpdated(updatedTask) {
    tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  }

  function handleTaskDeleted(deletedId) {
    tasks = tasks.filter(t => t.id !== deletedId);
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else}
  <h1>Rediger Projekt</h1>
  <ProjectForm {project} on:updated={e => handleUpdated(e.detail)} />

  <h2>Opret ny Task</h2>
  <TaskForm {project} on:created={e => handleTaskCreated(e.detail)} />

  <h2>Eksisterende Tasks</h2>
  <ul>
    {#each tasks as task}
      <li>
        {task.title} - {task.status} 
        {#if task.assigned_to} (Assigned to: {task.assigned_to}) {/if}
        <!-- Tilføj evt. rediger/slet knapper her også -->
      </li>
    {/each}
  </ul>
{/if}
