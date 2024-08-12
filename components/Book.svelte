<script>
	import { onMount } from 'svelte';

	export let book = {};
	export let proxy = false;

	const { user, pass, file } = book;
	let type = file.split('.').pop();

	let url = book.url;
	let pdfRef;
	let epubRef;

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
		if (user && pass) {
			if (proxy) {
				url = `/proxy?user=${user}&pass=${pass}&url=${encodeURIComponent(book.url)}`;
			} else {
				url = book.url.replace(/(https?):\/\//, `$1://${user}:${pass}@`);
			}
		} else if (proxy) {
			url = `/proxy?url=${encodeURIComponent(book.url)}`;
		} else {
			url = book.url;
		}
	}

	// Handle proxy checkbox change
	function handleCheckboxChange(event) {
		proxy = event.target.checked;
		proxifyUrl();
	}

	// Set the initial state of the proxy checkbox
	onMount(() => {
		const checkbox = document.querySelector('#proxy-checkbox');
		if (proxy) {
			checkbox.checked = true;
		}

		proxifyUrl();
	});

	$: proxifyUrl();

	$: if (url && (pdfRef || epubRef)) {
		if (type === 'pdf' && pdfRef) {
			pdfRef.data = url;
		} else if (type === 'epub' && epubRef) {
			epubRef.src = url;
		}
	}
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
			<object
				bind:this={pdfRef}
				type="application/pdf"
				data={url}
				width="100%"
				height="800px"
			>
				<p>Your browser does not support PDFs. <a href={url}>Download PDF</a>.</p>
			</object>
		{:else if type === 'epub'}
			<iframe bind:this={epubRef} src={url} width="100%" height="800px">
				<p>Your browser does not support EPUB files. <a href={url}>Download EPUB</a>.</p>
			</iframe>
		{:else}
			<p>Unsupported book format: {type}. <a href={url}>Download</a> instead.</p>
		{/if}

		<pre>{JSON.stringify(book, null, 2)}</pre>
	</section>
{/if}

<style>
	object,
	iframe {
		width: 100%;
		height: 800px;
		border: none;
	}

	.field {
		margin-bottom: 1em;
	}
</style>
