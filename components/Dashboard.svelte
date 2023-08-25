<script>
	export let data;
    let status = {};

    async function deleteLink(e, link) {
        e.preventDefault();
        try {
            const res = await fetch(`/links/${link.id}`, {
                method: 'DELETE',
            });

            const result = await res.json();
            status[link.id] = result;
            e.target.closest('li').remove();
        } catch(err) {
            status[link.id] = err;
        }


    }
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
            <a href="#" on:click={(e) => {
                deleteLink(e, link)
            }}>delete</a>
            {#if status[link.id]?.status}{status[link.id].status}{/if}
        </nav>
    </li>
{/each}
</ol>

<style>
    li {
        margin-bottom: 1.2rem;
    }
</style>