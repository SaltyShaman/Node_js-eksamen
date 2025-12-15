<script>
  import { createEventDispatcher } from "svelte";
  import { api } from "$lib/api.js";

  export let user = null;        // null = opret ny bruger
  export let canEdit = false;    // ADMIN/TEAM_LEADER kan ændre/oprette

  const dispatch = createEventDispatcher();

  let username = user?.username || "";
  let email = user?.email || "";
  let password = "";              // kun påkrævet ved oprettelse
  let userRole = user?.role || "STAFF";

  let error = "";
  let loading = false;

async function handleSubmit() {
  error = "";
  // Password påkrævet kun ved oprettelse
  if (!username.trim() || !email.trim() || (!user && !password.trim())) {
    error = "Brugernavn, email og password er påkrævet";
    return;
  }

  loading = true;
  try {
    let res;
    if (user) {
      // Update eksisterende bruger – send kun password hvis det er udfyldt
      const body = { username, email, role: userRole };
      if (password.trim()) body.password = password;

      res = await api(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
    } else {
      // Opret ny bruger
      res = await api("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, email, role: userRole, password })
      });

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

</script>

<form on:submit|preventDefault={handleSubmit}>
  {#if error}
    <p style="color:red">{error}</p>
  {/if}

  <input type="text" placeholder="Brugernavn" bind:value={username} disabled={!canEdit} />
  <input type="email" placeholder="Email" bind:value={email} disabled={!canEdit} />
  <input 
    type="password" 
    placeholder="Password" 
    bind:value={password} 
    disabled={!canEdit} 
  />
  <select bind:value={userRole} disabled={!canEdit}>
    <option value="STAFF">STAFF</option>
    <option value="TEAM_LEADER">TEAM_LEADER</option>
    <option value="ADMIN">ADMIN</option>
  </select>

  <button type="submit" disabled={loading || !canEdit}>
    {user ? "Opdater" : "Opret"}
  </button>
</form>
