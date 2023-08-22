<script>
	export let data;
</script>

<h1>Links</h1>

<ol>
{#each data.links as link}
    <li><a href="/links/{link.id}">{link.url}</a> ({#if link.alias}<a href="/a/{link.alias}">{link.alias}</a>,{/if} <a href="/l/{link.id}">{link.id}</a>)</li>
{/each}
</ol>
>