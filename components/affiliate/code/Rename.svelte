<script>
	export let name, error;
</script>

<h1>Rename "{name}"</h1>

<form method="post">
	{#if error}
		<div>{error}</div>
	{/if}
	<input name="name" placeholder="New Name" />
	<button type="submit">Rename</button>
</form>
