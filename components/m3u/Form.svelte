<script>
	export let status, errors;
</script>

<h1>Create an M3U channel list</h1>

<form method="post">
	{status ?? ''}
	<div><input name="url" placeholder="Enter url" required /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="name" placeholder="Enter name" /></div>
	<div>{errors?.name ?? ''}</div>
	<div><button type="submit"> Create </button></div>
</form>
