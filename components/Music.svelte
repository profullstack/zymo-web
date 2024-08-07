<script>
	export let music = [];
</script>

{#if music.length}
	<section>
		{#each music as file}
			<div class="music">
				<a href={file.url}>{file.mediaInfo.artist} / {file.mediaInfo.album} / {file.name}</a
				>
			</div>
		{/each}
	</section>
{/if}

<style>
	.music span {
		margin-right: 0.8rem;
	}
</style>
