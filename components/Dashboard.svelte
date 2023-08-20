<h1>Dashboard</h1>

<a href="/links">links</a>

<h2>Links</h2>

{#each data.links as link}
    <a href="/link/">{link.url}</a>
{/each}