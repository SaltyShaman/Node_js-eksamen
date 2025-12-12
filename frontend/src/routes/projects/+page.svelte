<script>
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import { api } from "$lib/api.js";

  import { projects, fetchProjects, initProjectSocket, clearProjectListeners } from "$lib/stores/projectStore.js";
  import { tasks, fetchTasks, initTaskSocket } from "$lib/stores/taskStore.js";

  let searchQuery = "";
  let searching = false;
  let taskError = "";

  // --- Søgning
  $: filteredProjects = $projects
    .filter(p => 
      !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.tasks?.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  // --- Projekt handlinger
  function handleEdit(projectId) {
    goto(`/projects/edit/${projectId}`);
  }

async function handleDelete(projectId) {
    if (!confirm("Er du sikker på, at du vil slette dette projekt?")) return;

    try {
        await api(`/api/projects/${projectId}`, { method: "DELETE" });
        projects.update(list => list.filter(p => p.id !== projectId));
    } catch (err) {
        console.error(err);
        alert("Kunne ikke slette projektet");
    }
}

  // --- Task handlers
async function handleTaskDeleted(projectId, taskId) {
    if (!confirm("Er du sikker på, at du vil slette denne task?")) return;

    try {
        await api(`/api/tasks/${taskId}`, { method: "DELETE" });
        tasks.update(list => list.filter(t => t.id !== taskId));
    } catch (err) {
        console.error(err);
        taskError = "Kunne ikke slette task";
    }
}

  onMount(async () => {
    await fetchProjects();
    await fetchTasks();

    // Start socket lyttere
    initProjectSocket();
    initTaskSocket();
  });

  onDestroy(() => {
    clearProjectListeners();
  });
</script>

<h1>Alle Projekter</h1>

<input 
  type="text" 
  placeholder="Søg efter projekt eller task…" 
  bind:value={searchQuery}
  style="padding:0.5rem; width:100%; max-width:400px; margin: 1rem 0;"
/>

{#if searching}<p>Søger...</p>{/if}
{#if $projects.length === 0}<p>Ingen projekter endnu.</p>
{:else}
  {#each filteredProjects as project}
    <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
      <h2>{project.name}</h2>
      <p>{project.description}</p>

      <button on:click={() => handleEdit(project.id)}>Rediger Projekt</button>
      <button on:click={() => handleDelete(project.id)}>Slet Projekt</button>

      <h3>Tasks:</h3>
      {#if taskError}<p style="color:red">{taskError}</p>{/if}

      <ul>
        {#each $tasks.filter(t => t.project_id === project.id) as task (task.id)}
          <li>
            <strong>{task.title}</strong> - {task.status} 
            {#if task.assigned_to} (Assigned to: {task.assigned_to}) {/if}
            <div style="margin-top:0.3rem;">
              <TaskForm {project} task={task} />
              <button on:click={() => handleTaskDeleted(project.id, task.id)} 
                      style="margin-top:0.2rem;">Slet Task</button>
            </div>
          </li>
        {/each}
      </ul>

      <h4>Opret ny Task</h4>
      <TaskForm {project} />
    </div>
  {/each}
{/if}
