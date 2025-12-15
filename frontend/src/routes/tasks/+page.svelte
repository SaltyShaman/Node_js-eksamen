<script>
  import { onMount, onDestroy } from "svelte";
  import TaskForm from "$lib/components/TaskForm.svelte";
  import TaskList from "$lib/components/TaskList.svelte";

  import { taskStore, fetchTasks, initTaskSocket, clearTaskListeners } from "$lib/stores/taskStore.js";
  import { projectStore, fetchProjects } from "$lib/stores/projectStore.js";

  let tasks = [];
  let projects = [];

  // Subscribe to stores
  const unsubscribeTasks = taskStore.subscribe(value => tasks = value);
  const unsubscribeProjects = projectStore.subscribe(value => projects = value);

  onMount(async () => {
    // Get initial data
    await fetchProjects();
    await fetchTasks();

    // Start Socket.IO
    initTaskSocket();
  });

  onDestroy(() => {
    // remove socket listeners
    clearTaskListeners();

    unsubscribeTasks();
    unsubscribeProjects();
  });
</script>

<h1>Opret og administrer Tasks</h1>

<TaskForm {projects} />

<TaskList {tasks} />
