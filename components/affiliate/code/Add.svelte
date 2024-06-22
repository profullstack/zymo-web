<script>
	export let error;
</script>

<h1>Create referral code</h1>

<form method="post">
	{#if error}
		<div>{error}</div>
	{/if}
	<input name="name" placeholder="Name" />
	<button type="submit">Create</button>
</form>
