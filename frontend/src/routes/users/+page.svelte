<script>
  import { onMount } from "svelte";
  import UserList from "$lib/components/UserList.svelte";
  import UserForm from "$lib/components/UserForm.svelte";
  import { fetchUsers, users, addUser, updateUser } from "$lib/stores/userStore.js";
  import { initUserSocket, clearUserListeners } from "$lib/stores/userStore.js";

  let currentUserRole = "ADMIN"; // Simuleret rolle
  let editingUser = null;         // Brugeren der redigeres

  onMount(async () => {
    await fetchUsers();
    initUserSocket();
    return () => clearUserListeners();
  });

  function handleEdit(user) {
    editingUser = { ...user };
  }

  function handleCreated(user) {
    addUser(user);
    editingUser = null;
  }

  function handleUpdated(user) {
    updateUser(user);
    editingUser = null;
  }
</script>

<h1>Brugere</h1>

<UserList {currentUserRole} on:editUser={(e) => handleEdit(e.detail)} />

{#if currentUserRole === "ADMIN" || currentUserRole === "TEAM_LEADER"}
  <h2>{editingUser ? "Rediger bruger" : "Opret ny bruger"}</h2>
  <UserForm 
    user={editingUser}
    canEdit={currentUserRole === "ADMIN" || currentUserRole === "TEAM_LEADER"}
    on:created={(e) => handleCreated(e.detail)}
    on:updated={(e) => handleUpdated(e.detail)}
  />
{/if}

<style>
  h1, h2 { margin-bottom: 0.5rem; }
</style>
