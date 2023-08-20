<script>
	export let data;
</script>

<h1>Dashboard</h1>

<a href="/links">links</a>

<h2>Links</h2>

<ol>
{#each data.links as link}
    <li><a href="/links/{link.id}">{link.url}</a></li>
{/each}
</ol>
