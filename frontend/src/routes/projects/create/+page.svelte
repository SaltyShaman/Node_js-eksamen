<script>
    import { api } from "$lib/api.js";
    import { goto } from "$app/navigation";

    let name = "";
    let description = "";
    let error = "";
    let loading = false;

    async function handleSubmit(e) {
        e.preventDefault();
        error = "";
        loading = true;

        try {
            const res = await api("/api/projects", {
                method: "POST",
                body: JSON.stringify({ name, description })
            });

            // backend errors:
            if (res.error) {
                error = res.error;
                return;
            }

            // Redirect
            goto("/projects");
        } catch (err) {
            console.error(err);
            error = "Noget gik galt. Prøv igen.";
        } finally {
            loading = false;
        }
    }
</script>

<h1>Opret Projekt</h1>

<form on:submit|preventDefault={handleSubmit}>
    {#if error}
        <p style="color:red">{error}</p>
    {/if}

    <div>
        <label for="name">Projekt Navn:</label>
        <input id="name" type="text" bind:value={name} required />
    </div>

    <div>
        <label for="description">Beskrivelse:</label>
        <textarea id="description" bind:value={description}></textarea>
    </div>

    <button type="submit" disabled={loading}>
        {#if loading}Opretter...{:else}Opret Projekt{/if}
    </button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 500px;
        margin: 2rem auto;
    }

    label {
        font-weight: bold;
    }

    input, textarea {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
    }
</style>
