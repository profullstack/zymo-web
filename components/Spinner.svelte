<script>
	export let isLoading = false;
	export let theme = 'dark';
</script>

{#if isLoading}
	<div class="spinner" class:light={theme === 'light'}></div>
{/if}

<style>
	.spinner {
		margin: 0.2rem 0.4rem;
		border: 4px solid rgba(0, 0, 0, 0.1);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border-left-color: var(--spinner-color);
		animation: spin 1s linear infinite;
	}

	.spinner.light {
		border-left-color: #fff;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
