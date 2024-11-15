<script>
import { onMount } from 'svelte';

export let q = '';
let data = {};

onMount(() => {
	console.log(data);
});
</script>

<h1>Search Results for "{q}"</h1>

{#if data.results}
    <div class="results">
        {#each data.results as result}
            <div class="result">
                <h3>{result.title}</h3>
            </div>
        {/each}
    </div>
{/if}

<style>
    .results {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .result {
        border: 1px solid var(--border-color);
        padding: 1rem;
    }
</style>
