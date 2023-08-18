<script>
    export let data;

    async function logout(e) {
        e.preventDefault();

        console.log('logout');
    }
</script>
<nav>
    {#if data.token}
        <a href="#" on:click.preventDefault={logout}>Logout</a>
    {:else}
        <a href="/login">Login</a>
        <a href="/register">Signup</a>
    {/if}
</nav>