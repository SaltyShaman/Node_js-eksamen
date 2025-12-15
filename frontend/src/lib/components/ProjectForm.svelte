<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { api } from "$lib/api.js";

  export let project = null; // Hvis null, new project

  const dispatch = createEventDispatcher();

  let name = "";
  let description = "";
  let loading = false;
  let error = "";

  onMount(() => {
    if (project) {
      name = project.name;
      description = project.description || "";
    }
  });

  async function handleSubmit() {
    if (!name.trim()) {
      error = "Navn på projekt er påkrævet.";
      return;
    }

    loading = true;
    error = "";

    try {
      let res;
      if (project) {
        res = await api(`/api/projects/${project.id}`, {
          method: "PUT",
          body: JSON.stringify({ name, description })
        });
        dispatch("updated", res.project);
      } else {
        res = await api("/api/projects", {
          method: "POST",
          body: JSON.stringify({ name, description })
        });
        dispatch("created", res.project);
        // Clear form
        name = "";
        description = "";
      }
    } catch (err) {
      console.error(err);
      error = err.message || "Noget gik galt.";
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  {#if error}
    <p style="color:red;">{error}</p>
  {/if}

  <div>
    <label for="name">Projekt Navn</label>
    <input id="name" type="text" bind:value={name} required />
  </div>

  <div>
    <label for="description">Beskrivelse</label>
    <textarea id="description" bind:value={description}></textarea>
  </div>

  <button type="submit" disabled={loading}>
    {#if loading}Gemmer...{:else}Gem{/if}
  </button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
  }
  input, textarea {
    width: 100%;
    padding: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
  }
</style>
