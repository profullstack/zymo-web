<script>
	export let status, errors;
</script>

<h1>Subscribe to a podcast</h1>

<form method="post">
	{status ?? ''}
	<div><input name="url" placeholder="Enter url to RSSfeed" required /></div>
	<div>{errors?.url ?? ''}</div>
	<div><button type="submit">Create</button></div>
</form>
