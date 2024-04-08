<script>
	export let isLoggedIn;
	const home = '/';

	async function logout(e) {
		e.preventDefault();

		console.log('logout');

		try {
			await fetch('/logout', {
				method: 'POST'
			});

			return (window.location = home);
		} catch (err) {
			console.error(err);
		}
	}
</script>

<nav>
	<a href="/" id="logo">Home</a>
	<a href="/blog">Blog</a>
    <a href="/products">Products</a>
	{#if isLoggedIn}
		<a href="#" on:click={logout}>Logout</a>
	{:else}
		<a href="/login">Login</a>
		<a href="/register">Signup</a>
	{/if}
</nav>
