<script>
	import VideoPlayer from './VideoPlayer.svelte';
	import { selectedChannel } from '../modules/store.js';
</script>

{#if $selectedChannel}
	<h2>{$selectedChannel.name}</h2>
	<VideoPlayer channel={$selectedChannel} />
{/if}
