<script>
  import { onMount } from "svelte";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import TaskList from "$lib/components/TaskList.svelte";
  import { api } from "$lib/api.js";

  let tasks = [];
  let projects = [];

  async function fetchProjects() {
    const res = await api("/api/projects");
    projects = res.projects;
  }

  async function fetchTasks() {
    const res = await api("/api/tasks"); // Din backend route til tasks
    tasks = res.tasks;
  }

  onMount(async () => {
    await fetchProjects();
    await fetchTasks();
  });

  function handleTaskCreated(task) {
    tasks = [...tasks, task];
  }

  function handleTaskUpdated(updatedTask) {
    tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  }

  function handleTaskDeleted(deletedId) {
    tasks = tasks.filter(t => t.id !== deletedId);
  }
</script>

<h1>Opret og administrer Tasks</h1>

<TaskForm {projects} on:created={e => handleTaskCreated(e.detail)} />

<TaskList {tasks} 
          on:updated={e => handleTaskUpdated(e.detail)} 
          on:deleted={e => handleTaskDeleted(e.detail)} />
