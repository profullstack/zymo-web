<script>
	export let isLoading = false;
</script>

{#if isLoading}
	<div class="spinner"></div>
{/if}

<style>
	.spinner {
		margin-left: 10px;
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border-left-color: var(--spinner-color);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
