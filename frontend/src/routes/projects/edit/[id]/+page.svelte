<script>
  import { onMount } from "svelte";
  import { api } from "$lib/api.js";
  import ProjectForm from "$lib/components/ProjectForm.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let project = null;
  let loading = true;
  let error = "";

  // Hent projekt-ID fra URL
  let id;
  $: id = $page.params.id;

  onMount(async () => {
    try {
      const res = await api(`/api/projects/${id}`);
      project = res.project;
    } catch (err) {
      console.error(err);
      error = "Kunne ikke hente projekt";
    } finally {
      loading = false;
    }
  });

  function handleUpdated(updatedProject) {
    // Redirect til visning af projekt eller liste
    goto("/projects");
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p style="color:red">{error}</p>
{:else}
  <h1>Rediger Projekt</h1>
  <ProjectForm {project} on:updated={e => handleUpdated(e.detail)} />
{/if}
