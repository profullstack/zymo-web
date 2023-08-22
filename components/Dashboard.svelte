<script>
	export let data;
</script>

<h1>Links</h1>

<ol>
{#each data.links as link}
    <li>
        <a href="{link.url}" target="_new">{link.url}</a>
         <nav>
            <a href="/links/{link.id}">edit</a>
            {#if link.alias}<a href="/a/{link.alias}">{link.alias}</a>{/if}
            <a href="/l/{link.id}">{link.id}</a>
        </nav>
    </li>
{/each}
</ol>

<style>
    li {
        margin-bottom: 1.2rem;
    }
</style>