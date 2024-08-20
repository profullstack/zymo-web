<script>
	export let status, errors;
</script>

<h1>Add an MLB.tv account</h1>

<form method="post">
	{status ?? ''}
	<div><input name="username" placeholder="Enter username" /></div>
	<div>{errors?.username ?? ''}</div>
	<div><input type="password" name="password" placeholder="Enter password" /></div>
	<div>{errors?.password ?? ''}</div>
	<div><button type="submit"> Create </button></div>
</form>
