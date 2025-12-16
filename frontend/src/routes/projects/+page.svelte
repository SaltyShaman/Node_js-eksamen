<script>
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import { api } from "$lib/api.js";

  import {
    projects,
    fetchProjects,
    initProjectSocket,
    clearProjectListeners
  } from "$lib/stores/projectStore.js";

  import {
    tasks,
    fetchTasks,
    initTaskSocket
  } from "$lib/stores/taskStore.js";

  import "./projectpage.css";

  let searchQuery = "";
  let taskError = "";

  
  $: filteredProjects = $projects.filter(project => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    if (project.name.toLowerCase().includes(q)) return true;

    return $tasks.some(
      task =>
        task.project_id === project.id &&
        task.title.toLowerCase().includes(q)
    );
  });

  function handleEdit(projectId) {
    goto(`/projects/edit/${projectId}`);
  }

  async function handleDelete(projectId) {
    if (!confirm("Er du sikker på, at du vil slette dette projekt?")) return;

    try {
      await api(`/api/projects/${projectId}`, { method: "DELETE" });
      projects.update(list => list.filter(p => p.id !== projectId));
    } catch (err) {
      alert("Kunne ikke slette projektet");
    }
  }

  async function handleTaskDeleted(projectId, taskId) {
    if (!confirm("Er du sikker på, at du vil slette denne task?")) return;

    try {
      await api(`/api/tasks/${taskId}`, { method: "DELETE" });
      tasks.update(list => list.filter(t => t.id !== taskId));
    } catch (err) {
      taskError = "Kunne ikke slette task";
    }
  }

  onMount(async () => {
    await fetchProjects();
    await fetchTasks();
    initProjectSocket();
    initTaskSocket();
  });

  onDestroy(() => {
    clearProjectListeners();
  });
</script>

<div class="page-wrapper">

  <h1 class="page-title">Alle Projekter</h1>

  <input
    class="search-input"
    type="text"
    placeholder="Søg efter projekt eller task…"
    bind:value={searchQuery}
  />

  {#if $projects.length === 0}
    <p>Ingen projekter endnu.</p>
  {:else}
    {#each filteredProjects as project}
      <div class="project-card">
        <h2>{project.name}</h2>
        <p>{project.description}</p>

        <div class="project-actions">
          <button class="update" on:click={() => handleEdit(project.id)}>Rediger Projekt</button>
          <button class="danger" on:click={() => handleDelete(project.id)}>Slet Projekt</button>
        </div>

        <h3>Tasks:</h3>
        {#if taskError}
          <p class="error">{taskError}</p>
        {/if}

<ul class="task-list">
  {#each $tasks.filter(t => t.project_id === project.id) as task (task.id)}
    <li class="task-item">
      <strong>{task.title}</strong> – {task.status}
      {#if task.assigned_to}
        (Assigned to: {task.assigned_to})
      {/if}

  <div class="task-actions">
    <TaskForm {project} task={task} />
   <div class="task-delete">
      <button on:click={() => handleTaskDeleted(project.id, task.id)}>
        Slet Task
      </button>
    </div>
  </div>
    </li>
  {/each}
</ul>

        <h4>Opret ny Task</h4>
        <TaskForm {project} />
      </div>
    {/each}
  {/if}
</div>