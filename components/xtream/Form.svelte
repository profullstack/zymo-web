<script>
	export let status, errors;
</script>

<h1>Create an Xtream code channel list</h1>

<form method="post">
	{status ?? ''}
	<div><input name="name" placeholder="Enter name" required /></div>
	<div>{errors?.name ?? ''}</div>
	<div><input name="url" placeholder="Enter url" required /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="username" placeholder="Enter username" required /></div>
	<div>{errors?.username ?? ''}</div>
	<div><input name="password" type="password" placeholder="Enter password"  required/></div>
	<div>{errors?.password ?? ''}</div>
	<!-- <div><input name="epg" placeholder="EPG url" /></div>
	<div>{errors?.epg ?? ''}</div> -->
	<div><button type="submit"> Create </button></div>
</form>
