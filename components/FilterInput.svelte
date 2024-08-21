<script>
	import { createEventDispatcher } from 'svelte';

	export let placeholder = 'Filter...';
	export let filterText = '';

	const dispatch = createEventDispatcher();

	function handleInput(event) {
		filterText = event.target.value;
		dispatch('filter', { filterText }); // Dispatching the event with the updated filterText
	}
</script>

<div class="filter">
	<input type="text" {placeholder} bind:value={filterText} on:input={handleInput} />
</div>

<style>
	input {
		width: 100%;
		max-width: 50vw;
		padding: 0.4rem 0.8rem;
		font-size: 1.6rem;
	}
</style>
