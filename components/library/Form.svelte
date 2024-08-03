<script>
	export let status, errors;

	const library = {};
</script>

<h1>Create a Library</h1>

<form method="post">
	{status ?? ''}
	<div><input name="url" placeholder="Enter url" required /></div>
	<div>{errors?.url ?? ''}</div>
	<div><input name="name" placeholder="Enter name" required /></div>
	<div>{errors?.name ?? ''}</div>
	<h4>For basic auth (optional):</h4>
	<div><input name="user" placeholder="Enter username"  /></div>
	<div>{errors?.user ?? ''}</div>
	<div>
		<input
			name="pass"
			type="password"
			placeholder="Enter password"
			
		/>
	</div>
	<div>{errors?.pass ?? ''}</div>
	<div><button type="submit">Create</button></div>
</form>
