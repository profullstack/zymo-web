<script>
	export let next, status, errors;
</script>

<svelte:head>
	<title>Reset password</title>
</svelte:head>

<h1>Reset password</h1>

<form method="post">
	{status ?? ''}
	<div><input name="email" placeholder="Enter email address" required /></div>
	<div>{errors?.email ?? ''}</div>
	<div><button type="submit">Reset password</button></div>
</form>
