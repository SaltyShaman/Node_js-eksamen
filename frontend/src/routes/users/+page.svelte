<script>
  import { onMount } from "svelte";
  import UserList from "$lib/components/UserList.svelte";
  import UserForm from "$lib/components/UserForm.svelte";
  import { fetchUsers, users } from "$lib/stores/userStore.js";
  import { initUserSocket, clearUserListeners } from "$lib/stores/userStore.js";

  // Simuleret rolle – i praksis skal den komme fra din session / auth
  let currentUserRole = "ADMIN"; // eller "TEAM_LEADER", "STAFF"

  onMount(async () => {
    await fetchUsers();
    initUserSocket();

    return () => {
      clearUserListeners();
    };
  });
</script>

<h1>Brugere</h1>

<!-- UserList viser liste og redigeringsmuligheder -->
<UserList {currentUserRole} />

<!-- Hvis currentUserRole er ADMIN eller TEAM_LEADER kan man oprette nye brugere -->
{#if currentUserRole === "ADMIN" || currentUserRole === "TEAM_LEADER"}
  <h2>Opret ny bruger</h2>
  <UserForm 
    canEdit={currentUserRole === "ADMIN" || currentUserRole === "TEAM_LEADER"} 
    on:created={(e) => console.log("Ny bruger oprettet:", e.detail)}
  />
{/if}

<style>
  h1, h2 {
    margin-bottom: 0.5rem;
  }
</style>
