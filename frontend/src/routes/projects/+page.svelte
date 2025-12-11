<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import { goto } from "$app/navigation";
  import TaskForm from "$lib/components/TaskForm.svelte";

  let projects = [];
  let loading = true;
  let error = "";
  let searchQuery = "";
  let searching = false;
  let taskError = "";

  //fetch all projects
  async function fetchProjects() {
    loading = true;
    try {
      const res = await api("/api/projects");
      projects = res.projects;
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente projekter";
    } finally {
      loading = false;
    }
  }

  function handleEdit(projectId) {
    goto(`/projects/edit/${projectId}`);
  }

  async function handleDelete(projectId) {
    if (!confirm("Er du sikker på, at du vil slette dette projekt?")) return;

    try {
      await api(`/api/projects/${projectId}`, { method: "DELETE" });
      // Fjern projektet fra listen lokalt
      projects = projects.filter(p => p.id !== projectId);
    } catch (err) {
      console.error(err);
      alert("Kunne ikke slette projektet");
    }
  }

  async function searchProjects() {
    if (searchQuery.trim() === "") {
      fetchProjects();
      return;
    }

    searching = true;
    try {
      const res = await api(`/api/projects/search?query=${encodeURIComponent(searchQuery)}`);
      projects = res.projects;
    } finally {
      searching = false;
    }
  }

  function handleTaskCreated(projectId, newTask) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.tasks = [...project.tasks, newTask];
    }
  }

  function handleTaskUpdated(projectId, updatedTask) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.tasks = project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    }
  }

  async function handleTaskDeleted(projectId, taskId) {
    if (!confirm("Er du sikker på, at du vil slette denne task?")) return;
    try {
      await api(`/api/tasks/${taskId}`, { method: "DELETE" });
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.tasks = project.tasks.filter(t => t.id !== taskId);
      }
    } catch (err) {
      console.error(err);
      taskError = "Kunne ikke slette task";
    }
  }

  onMount(() => {
    fetchProjects();
  });
</script>

<h1>Alle Projekter</h1>

<input 
  type="text" 
  placeholder="Søg efter projekt eller task…" 
  bind:value={searchQuery}
  on:input={searchProjects}
  style="padding:0.5rem; width:100%; max-width:400px; margin: 1rem 0;"
/>

{#if searching}
  <p>Søger...</p>
{/if}

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else if projects.length === 0}
  <p>Ingen projekter endnu.</p>
{:else}
  {#each projects as project}
    <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
      <h2>{project.name}</h2>
      <p>{project.description}</p>

      <button on:click={() => handleEdit(project.id)}>Rediger Projekt</button>
      <button on:click={() => handleDelete(project.id)}>Slet Projekt</button>

      <h3>Tasks:</h3>
      {#if taskError}
        <p style="color:red">{taskError}</p>
      {/if}

      <ul>
        {#each project.tasks as task (task.id)}
          <li>
            <strong>{task.title}</strong> - {task.status} 
            {#if task.assigned_to} (Assigned to: {task.assigned_to}) {/if}
            <div style="margin-top:0.3rem;">
              <TaskForm {project} task={task} 
                        on:updated={e => handleTaskUpdated(project.id, e.detail)} />
              <button on:click={() => handleTaskDeleted(project.id, task.id)} 
                      style="margin-top:0.2rem;">Slet Task</button>
            </div>
          </li>
        {/each}
      </ul>

      <h4>Opret ny Task</h4>
      <TaskForm {project} on:created={e => handleTaskCreated(project.id, e.detail)} />
    </div>
  {/each}
{/if}
