<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import UserList from "$lib/components/UserList.svelte";
  import UserForm from "$lib/components/UserForm.svelte";
  import { fetchUsers, addUser, updateUser } from "$lib/stores/userStore.js";
  import { initUserSocket, clearUserListeners } from "$lib/stores/userStore.js";

  import "./userspage.css"; 

  let editingUser = null;
  let ready = false; // await API data 

  onMount(async () => {
    try {
      // 🔹 Hent alle brugere og start sockets
      await fetchUsers();
      initUserSocket();
      ready = true;
    } catch (err) {
      console.error("Fejl ved hentning af brugere:", err);
      goto("/login"); // send to login hvis ikke logget ind
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

  <!-- Vis alle brugere -->
  <UserList on:editUser={(e) => handleEdit(e.detail)} />

  <h2>{editingUser ? "Rediger bruger" : "Opret ny bruger"}</h2>
  <UserForm 
    user={editingUser}
    canEdit={true} 
    on:created={(e) => handleCreated(e.detail)}
    on:updated={(e) => handleUpdated(e.detail)}
  />
{/if}
