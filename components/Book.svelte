<script>
	import { onMount } from 'svelte';
	import ePub from 'epubjs';

	export let book = {};
	export let proxy = false;

	const { user, pass, file } = book;
	let type = file.split('.').pop();

	let url = book.url;
	let epubRef;
	let rendition;
	let bookInstance;

	// Determine the human-readable title and path for the book
	try {
		book.humanTitle = decodeURIComponent(book.title);
	} catch (err) {
		console.error(err, book.title);
		book.humanTitle = book.title;
	}

	try {
		book.humanPath = decodeURIComponent(book.path);
	} catch (err) {
		book.humanPath = book.path;
	}

	// Function to modify the URL based on proxy settings
	function proxifyUrl() {
		if (proxy) {
			// Proxy with authentication
			if (user && pass) {
				url = `/proxy?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&url=${encodeURIComponent(book.url)}`;
			} else {
				// Proxy without authentication
				url = `/proxy?url=${encodeURIComponent(book.url)}`;
			}
		} else {
			url = book.url;
		}
	}

	// Handle proxy checkbox change
	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		proxifyUrl();
		initializeEpubReader();
	}

	// Initialize ePub.js with continuous scrolling
	function initializeEpubReader() {
		if (rendition) {
			rendition.destroy();
		}
		bookInstance = ePub(url);
		rendition = bookInstance.renderTo(epubRef, {
			width: '100%',
			height: '100%',
			manager: 'continuous', // Enable continuous scrolling
			viewer: 'html'
		});

		rendition.display();
	}

	// Navigation functions
	function goToPreviousPage() {
		if (rendition) {
			rendition.prev();
		}
	}

	function goToNextPage() {
		if (rendition) {
			rendition.next();
		}
	}

	// Set the initial state of the proxy checkbox
	onMount(() => {
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy) {
			checkbox.checked = true;
		}

		proxifyUrl();
		initializeEpubReader();
	});

	$: proxifyUrl();
</script>

{#if url}
	<section>
		<h1><a href={book.url}>{book.humanTitle}</a></h1>
		<div class="field">
			<label>
				<input
					type="checkbox"
					id="proxy-checkbox"
					on:change={handleCheckboxChange}
					bind:checked={proxy}
				/>
				Enable proxy
			</label>
		</div>

		{#if type === 'pdf'}
			<object type="application/pdf" data={url} width="100%" height="800px">
				<p>Your browser does not support PDFs. <a href={url}>Download PDF</a>.</p>
			</object>
		{:else if type === 'epub'}
			<div class="epub-container" bind:this={epubRef}></div>
			<div class="button-container">
				<button on:click={goToPreviousPage}>Previous</button>
				<button on:click={goToNextPage}>Next</button>
			</div>
		{:else}
			<p>Unsupported book format: {type}. <a href={url}>Download</a> instead.</p>
		{/if}

		<pre>{JSON.stringify(book, null, 2)}</pre>
	</section>
{/if}

<style>
	.epub-container {
		width: 100%;
		height: 800px;
		border: none;
		background-color: white;
		overflow: auto;
	}

	.field {
		margin-bottom: 1em;
	}

	.button-container {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.button-container button {
		padding: 0.5rem 1rem;
		margin: 0 0.5rem;
		font-size: 1rem;
		cursor: pointer;
	}
</style>
