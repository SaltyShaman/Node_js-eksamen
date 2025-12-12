<script>
  import { users, removeUser } from "$lib/stores/userStore.js";
  import { onMount } from "svelte";
  import UserForm from "./UserForm.svelte";
  import { api } from "$lib/api.js";

  export let currentUserRole = "STAFF";

  let editingUser = null;

  onMount(() => {
    users.subscribe(value => value);
  });

  function editUser(user) {
    editingUser = { ...user };
  }

  async function deleteUser(userId) {
    if (!confirm("Er du sikker på, du vil slette brugeren?")) return;

    try {
      // Brug api helper i stedet for fetch direkte
      await api(`/api/users/${userId}`, { method: "DELETE" });
      removeUser(userId);
    } catch (err) {
      console.error("Kunne ikke slette bruger:", err);
      alert(err.message || "Noget gik galt ved sletning.");
    }
  }
</script>

<ul>
  {#each $users as u}
    <li>
      {u.username} ({u.role}) - {u.email}
      {#if currentUserRole === "ADMIN"}
        <button on:click={() => editUser(u)}>Rediger</button>
        <button on:click={() => deleteUser(u.id)}>Slet</button>
      {/if}
    </li>
  {/each}
</ul>
