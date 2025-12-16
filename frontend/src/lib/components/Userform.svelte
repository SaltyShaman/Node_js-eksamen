<script>
  import { createEventDispatcher } from "svelte";
  import { api } from "$lib/api.js";

  export let user = null;        // null = create new users
  export let canEdit = false;    // ADMIN/TEAM_LEADER restricted

  import "./UserForm.css";


  const dispatch = createEventDispatcher();

  let username = user?.username || "";
  let email = user?.email || "";
  let password = "";              
  let userRole = user?.role || "STAFF"; //default role option for create

  let error = "";
  let loading = false;

  async function handleSubmit() {
    error = "";
    if (!username.trim() || !email.trim() || (!user && !password.trim())) {
      error = "Brugernavn, email og password er påkrævet";
      return;
    }

    loading = true;
    try {
      if (user) {
        const body = { username, email, role: userRole };
        if (password.trim()) body.password = password;

        await api(`/api/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        });
        dispatch("updated", { ...user, username, email, role: userRole });
      } else {
        const res = await api("/api/users", {
          method: "POST",
          body: JSON.stringify({ username, email, role: userRole, password })
        });
        dispatch("created", { username, email, role: userRole });

        // Clear form
        username = "";
        email = "";
        password = "";
        userRole = "STAFF";
      }
    } catch (err) {
      console.error(err);
      error = err.message || "Noget gik galt";
    } finally {
      loading = false;
    }
  }

  async function handleDelete() {
    if (!confirm(`Er du sikker på, at du vil slette brugeren ${username}?`)) return;

    loading = true;
    try {
      await api(`/api/users/${user.id}`, { method: "DELETE" });
      dispatch("deleted", { id: user.id });
    } catch (err) {
      console.error(err);
      error = err.message || "Kunne ikke slette bruger";
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="user-form">
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <input type="text" placeholder="Brugernavn" bind:value={username} disabled={!canEdit} />
  <input type="email" placeholder="Email" bind:value={email} disabled={!canEdit} />
  <input type="password" placeholder="Password" bind:value={password} disabled={!canEdit} />
  <select bind:value={userRole} disabled={!canEdit}>
    <option value="STAFF">STAFF</option>
    <option value="TEAM_LEADER">TEAM_LEADER</option>
    <option value="ADMIN">ADMIN</option>
  </select>

  <div class="form-actions">
    <button type="submit" class="update" disabled={loading || !canEdit}>
      {user ? "Opdater" : "Opret"}
    </button>

    {#if user && canEdit}
      <button type="button" class="danger" on:click={handleDelete} disabled={loading}>
        Slet
      </button>
    {/if}
  </div>
</form>

<style>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-form input,
.user-form select {
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
}

.user-form .form-actions {
  display: flex;
  gap: 0.5rem;
}

button.update {
  background-color: #007BFF; /* Blå */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button.update:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

button.danger {
  background-color: #f44336; /* Rød */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button.danger:hover {
  background-color: #da190b;
  transform: scale(1.05);
}

.error {
  color: red;
}
</style>
