<script>
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api.js";
  import { tasks, initTaskSocket, clearTaskListeners } from "$lib/stores/taskStore.js";

  let staffProjects = []; // Data: staff -> projects -> tasks
  let filteredStaffProjects = [];
  let loading = true;
  let error = "";
  let searchQuery = "";

  // Subscribe til taskStore for live updates
  const unsubscribe = tasks.subscribe(list => {
    buildStaffProjects(list);
  });

  // 🔹 Strukturér tasks som Staff -> Projects -> Tasks
  function buildStaffProjects(taskList) {
    const map = {};

    taskList.forEach(task => {
      const userId = task.assigned_to || "unassigned";
      const username = task.assigned_to_name || "Ukjent";

      if (!map[userId]) {
        map[userId] = { id: userId, username, projects: {} };
      }

      const projectName = task.project_name || "Ukjent projekt";

      if (!map[userId].projects[projectName]) {
        map[userId].projects[projectName] = [];
      }

      map[userId].projects[projectName].push(task);
    });

    // Transformér til array for rendering
    staffProjects = Object.values(map).map(staff => ({
      ...staff,
      projects: Object.entries(staff.projects).map(([projectName, tasks]) => ({
        projectName,
        tasks: tasks.sort((a, b) => a.title.localeCompare(b.title))
      }))
    }));

    filteredStaffProjects = filterStaffProjects(staffProjects, searchQuery);
  }

  function filterStaffProjects(staffProjects, query) {
    if (!query.trim()) return [...staffProjects];

    const q = query.toLowerCase();
    return staffProjects
      .map(staff => ({
        ...staff,
        projects: staff.projects
          .map(p => ({
            ...p,
            tasks: p.tasks.filter(
              t =>
                t.title.toLowerCase().includes(q) ||
                t.project_name.toLowerCase().includes(q)
            )
          }))
          .filter(p => p.tasks.length > 0)
      }))
      .filter(staff =>
        staff.projects.length > 0 || staff.username.toLowerCase().includes(q)
      );
  }

  // 🔹 API integration for initial fetch
  async function fetchTasksFromAPI() {
    loading = true;
    try {
      const res = await api("/api/tasks"); // hent alle tasks
      if (!res || !res.tasks) {
        error = "Kunne ikke hente tasks fra API";
        return;
      }

      const flatTasks = res.tasks.map(t => ({
        ...t,
        assigned_to_name: t.assigned_to_name || "Ukjent"
      }));

      tasks.set(flatTasks); // push til store → triggers buildStaffProjects
    } catch (err) {
      console.error(err);
      error = "Fejl ved hentning af tasks";
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    await fetchTasksFromAPI();
    try {
      initTaskSocket(); // start socket listeners
    } catch (err) {
      console.error("Kunne ikke initialisere sockets:", err);
      error = "Noget gik galt med websocket.";
    }
  });

  onDestroy(() => {
    clearTaskListeners();
    unsubscribe();
  });
</script>

<style>
  .staff-container { padding: 1rem; }
  .staff-block { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #444; border-radius: 8px; }
  .project-block { margin-left: 1rem; margin-bottom: 1rem; padding: 0.5rem; border-left: 3px solid #888; }
  .task-item { margin-left: 1rem; }
</style>

<div class="staff-container">
  {#if loading}
    <p>Indlæser...</p>
  {:else if error}
    <p style="color:red">{error}</p>
  {:else}
    <input
      type="text"
      placeholder="Søg efter medarbejder, projekt eller task..."
      bind:value={searchQuery}
      style="margin-bottom: 1rem; width: 100%; padding: 0.5rem;"
      on:input={() => filteredStaffProjects = filterStaffProjects(staffProjects, searchQuery)}
    />

    {#each filteredStaffProjects as staff}
      <div class="staff-block">
        <h2>{staff.username}</h2>

        {#if staff.projects.length === 0}
          <p><i>Ingen tasks</i></p>
        {:else}
          {#each staff.projects as project}
            <div class="project-block">
              <strong>{project.projectName}</strong>
              {#each project.tasks as task}
                <div class="task-item">
                  {task.title} ({task.status})
                </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {/each}
  {/if}
</div>
