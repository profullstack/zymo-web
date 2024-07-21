<script>
	export let status, email;
</script>

<svelte:head>
	<title>New password</title>
</svelte:head>

<h1>New password</h1>
<h3>Set a new password for "{email}"</h3>
<form method="post">
	{status ?? ''}
	<div><input name="new_password" placeholder="New Password" required /></div>
	<div><input name="confirm_password" placeholder="Confirm Password" required /></div>
	<div><button type="submit">Reset password</button></div>
</form>
