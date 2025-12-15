<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import UserList from "$lib/components/UserList.svelte";
  import UserForm from "$lib/components/UserForm.svelte";
  import { fetchUsers, addUser, updateUser } from "$lib/stores/userStore.js";
  import { initUserSocket, clearUserListeners } from "$lib/stores/userStore.js";

  let currentUserRole = null; // used to reset role and staff redirects
  let editingUser = null;
  let ready = false; // await API data 

  onMount(async () => {
    try {
  
      // 🔹Staff can't even see the formular
      if (currentUserRole === "STAFF") {
        goto("/"); // redirect staff to dashboard
        return;
      }

      // 🔹 Get users from API and start sockets
      await fetchUsers();
      initUserSocket();
      ready = true;

    } catch (err) {
      console.error("Fejl ved hentning af brugerrolle:", err);
      goto("/login"); // send to login if user is not logged in
    }

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

{#if ready}
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
{/if}

<style>
  h1, h2 { margin-bottom: 0.5rem; }
</style>
