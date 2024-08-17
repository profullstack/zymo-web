<script>
	export let liveStreams = [];
</script>

<ul>
	{#each liveStreams as stream}
		<li><pre>{JSON.stringify(stream, null, 2)}</pre></li>
	{/each}
</ul>
