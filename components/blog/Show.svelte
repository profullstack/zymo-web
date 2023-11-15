<script>
    export let post;
    export let html;
</script>

{#if post}
<article>
    <h1>{post.title}</h1>

    {@html html}
</article>
{/if}