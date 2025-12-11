<script>
  import { onMount, onDestroy } from "svelte";
  import { api } from "$lib/api.js";
  import { connectSocket } from "$lib/socket.js";

  let staffTasks = [];
  let filteredStaffTasks = [];
  let loading = true;
  let error = "";
  let searchQuery = "";

  let socket;

  async function fetchStaffTasks() {
    loading = true;
    try {
      const res = await api("/api/tasks/staff"); 
      console.log("🔍 /api/tasks/staff response:", res);

      if (!res || !res.staffTasks) {
        console.error("❌ res.staffTasks undefined:", res);
        error = "API returnerede ikke staffTasks.";
        return;
      }

      staffTasks = res.staffTasks.map(staff => ({
        ...staff,
        tasks: (staff.tasks || []).sort((a, b) =>
          (a.project_name || "").localeCompare(b.project_name || "")
        )
      }));

      filteredStaffTasks = [...staffTasks];
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente tasks for staff";
    } finally {
      loading = false;
    }
  }

  // Søgning
  $: filteredStaffTasks =
    searchQuery.trim() === ""
      ? [...staffTasks]
      : staffTasks
          .map(staff => ({
            ...staff,
            tasks: staff.tasks.filter(
              t =>
                t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          }))
          .filter(
            staff =>
              staff.tasks.length > 0 ||
              staff.username.toLowerCase().includes(searchQuery.toLowerCase())
          );

  let handleTaskUpdated;
  let handleTaskCreated;
  let handleTaskDeleted;

  onMount(async () => {
    await fetchStaffTasks();

    socket = connectSocket();
    console.log("🔌 Socket connected:", socket);

    // Event handlers
    handleTaskUpdated = updatedTask => {
      console.log("🟡 taskUpdated received:", updatedTask);

      // Fjern task fra gammel staff
      staffTasks = staffTasks.map(staff => ({
        ...staff,
        tasks: staff.tasks.filter(t => t.id !== updatedTask.id)
      }));

      // Tilføj til ny staff
      if (updatedTask.assigned_to) {
        const index = staffTasks.findIndex(s => s.id === updatedTask.assigned_to);
        if (index !== -1) {
          staffTasks[index].tasks.push(updatedTask);
          staffTasks[index].tasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
        }
      }

      filteredStaffTasks = [...staffTasks];
    };

    handleTaskCreated = newTask => {
      console.log("🟢 taskCreated received:", newTask);

      if (newTask.assigned_to) {
        const index = staffTasks.findIndex(s => s.id === newTask.assigned_to);
        if (index !== -1) {
          staffTasks[index].tasks.push(newTask);
          staffTasks[index].tasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
        }
      }

      filteredStaffTasks = [...staffTasks];
    };

    handleTaskDeleted = ({ id }) => {
      console.log("🔴 taskDeleted received:", id);

      staffTasks = staffTasks.map(staff => ({
        ...staff,
        tasks: staff.tasks.filter(t => t.id !== id)
      }));

      filteredStaffTasks = [...staffTasks];
    };

    // Socket listeners
    socket.on("taskUpdated", handleTaskUpdated);
    socket.on("taskCreated", handleTaskCreated);
    socket.on("taskDeleted", handleTaskDeleted);
  });

  onDestroy(() => {
    if (socket) {
      socket.off("taskUpdated", handleTaskUpdated);
      socket.off("taskCreated", handleTaskCreated);
      socket.off("taskDeleted", handleTaskDeleted);
    }
  });
</script>

<style>
  .staff-container {
    padding: 1rem;
  }
  .staff-block {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #444;
    border-radius: 8px;
  }

</style>

{#if loading}
  <p>Indlæser...</p>
{:else if error}
  <p style="color: red">{error}</p>
{:else}
  <div class="staff-container">
    <input
      type="text"
      placeholder="Søg efter medarbejder, task eller projekt..."
      bind:value={searchQuery}
      style="margin-bottom: 1rem; width: 100%; padding: 0.5rem;"
    />

    {#each filteredStaffTasks as staff}
      <div class="staff-block">
        <h2>{staff.username}</h2>

        {#if staff.tasks.length === 0}
          <p><i>Ingen tasks</i></p>
        {:else}
          {#each staff.tasks as task}
            <div class="task">
              <strong>{task.title}</strong> — {task.project_name}
            </div>
          {/each}
        {/if}
      </div>
    {/each}
  </div>
{/if}
