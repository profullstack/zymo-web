<script>
	import Spinner from './Spinner.svelte';
	export let apikeys = [];
	export let phoneUnverified;
	export let m3us = [];
	export let libraries = [];
	export let clients = [];
	export let xtream_codes = [];

	let scans = {};
	let status = {};
	let isScanning = {};
	let scanProgress = {};

	async function deleteTorrentClient(e, client) {
		e.preventDefault();
		try {
			const res = await fetch(`/torrents/${client.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[client.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[client.id] = err;
		}
	}

	async function deleteM3u(e, m3u) {
		e.preventDefault();
		try {
			const res = await fetch(`/live/stream/${m3u.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[m3u.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[m3u.id] = err;
		}
	}

	async function deleteXtream(e, provider) {
		e.preventDefault();
		try {
			const res = await fetch(`/xtream/stream/${provider.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[provider.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[provider.id] = err;
		}
	}

	async function scan(e, library) {
		isScanning[library.id] = true;
		scanProgress[library.id] = { filesFound: 0, status: 'Starting scan...' };
		scans[library.id] = { foundFiles: [] };
		e.preventDefault();
		
		try {
			// Connect directly to the API endpoint which proxies the crawler SSE
			const eventSource = new EventSource(`/api/parsers/html?id=${library.id}`);
			
			eventSource.addEventListener('start', (event) => {
				const data = JSON.parse(event.data);
				scanProgress[library.id] = {
					filesFound: 0,
					status: 'Scanning...'
				};
			});
			
			eventSource.addEventListener('progress', (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'file' && data.file) {
					if (!scans[library.id]) {
						scans[library.id] = { foundFiles: [] };
					}
					scans[library.id].foundFiles.push(data.file);
					scanProgress[library.id] = {
						filesFound: data.totalFiles || scans[library.id].foundFiles.length,
						status: data.file.title
					};
				}
			});
			
			eventSource.addEventListener('complete', (event) => {
				const data = JSON.parse(event.data);
				const fileCount = scans[library.id]?.foundFiles?.length || 0;
				scanProgress[library.id] = {
					filesFound: fileCount,
					status: fileCount > 0 ? `Scan complete! Found ${fileCount} files.` : 'Scan complete. No files found.'
				};
				isScanning[library.id] = false;
				eventSource.close();
			});
			
			eventSource.addEventListener('error', (event) => {
				const data = event.data ? JSON.parse(event.data) : {};
				scanProgress[library.id] = {
					filesFound: scans[library.id]?.foundFiles?.length || 0,
					status: 'Scan failed: ' + (data.message || 'Connection error')
				};
				isScanning[library.id] = false;
				eventSource.close();
			});
			
			eventSource.onerror = () => {
				if (isScanning[library.id]) {
					scanProgress[library.id] = {
						filesFound: scans[library.id]?.foundFiles?.length || 0,
						status: 'Scan failed: Connection error'
					};
					isScanning[library.id] = false;
				}
				eventSource.close();
			};
		} catch (err) {
			status[library.id] = err;
			scanProgress[library.id] = {
				filesFound: 0,
				status: 'Scan failed: ' + (err.message || 'Unknown error')
			};
			isScanning[library.id] = false;
		}
	}

	async function deleteLibrary(e, library) {
		e.preventDefault();
		try {
			const res = await fetch(`/library/${library.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[library.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[library.id] = err;
		}
	}

	async function deleteApiKey(e, apikey) {
		e.preventDefault();
		try {
			const res = await fetch(`/apikeys/${apikey.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[apikey.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[apikey.id] = err;
		}
	}

	function gatherBrowserInfo() {
		return {
			navigator: {
				userAgent: navigator.userAgent,
				appName: navigator.appName,
				appVersion: navigator.appVersion,
				platform: navigator.platform,
				cookieEnabled: navigator.cookieEnabled,
				onLine: navigator.onLine,
				language: navigator.language,
				languages: navigator.languages,
				hardwareConcurrency: navigator.hardwareConcurrency
			},
			screen: {
				width: window.screen.width,
				height: window.screen.height,
				availWidth: window.screen.availWidth,
				availHeight: window.screen.availHeight,
				colorDepth: window.screen.colorDepth
			},
			window: {
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
				outerWidth: window.outerWidth,
				outerHeight: window.outerHeight
			},
			document: {
				referrer: document.referrer,
				domain: document.domain,
				URL: document.URL,
				title: document.title,
				lastModified: document.lastModified
			},
			location: {
				href: location.href,
				protocol: location.protocol,
				host: location.host,
				hostname: location.hostname,
				port: location.port,
				pathname: location.pathname,
				search: location.search
			},
			// Attempting to get network information, but this might not be available in many browsers.
			connection: navigator.connection
				? {
						effectiveType: navigator.connection.effectiveType,
						rtt: navigator.connection.rtt,
						downlink: navigator.connection.downlink
					}
				: null
		};
	}

	async function track(e, link) {
		e.preventDefault();

		try {
			const data = gatherBrowserInfo();
			const response = await fetch(`/track/${link.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			const result = await response.json();
			console.log(result);
		} catch (err) {
			console.error(err);
		} finally {
			window.location.href = e.target.href;
		}
	}
</script>

<h2>API keys</h2>

<ol>
	{#each apikeys as apikey}
		<li>
			{apikey.name} - {apikey.id}
			<nav>
				<a href="/apikeys/{apikey.id}">edit</a>
				<a
					href="#"
					on:click={(e) => {
						deleteApiKey(e, apikey);
					}}>delete</a
				>
				{#if status[apikey.id]?.status}{status[apikey.id].status}{/if}
			</nav>
		</li>
	{/each}
</ol>

<h2>M3U channel links</h2>
<ol>
	{#each m3us as m3u}
		<li>
			{m3u.name} - {m3u.id}
			<nav>
				<a href="/live/stream/{m3u.id}">edit</a>
				<a
					href="#"
					on:click={(e) => {
						deleteM3u(e, m3u);
					}}>delete</a
				>
				{#if status[m3u.id]?.status}{status[m3u.id].status}{/if}
			</nav>
		</li>
	{/each}
</ol>

<h2>Xtream codes</h2>

<ol>
	{#each xtream_codes as provider}
		<li>
			{provider.name} - {provider.id}
			<nav>
				<a href="/xtream/stream/{provider.id}">edit</a>
				<a
					href="#"
					on:click={(e) => {
						deleteXtream(e, provider);
					}}>delete</a
				>
				{#if status[provider.id]?.status}{status[provider.id].status}{/if}
			</nav>
		</li>
	{/each}
</ol>

<h2>Libraries</h2>
<ol>
	{#each libraries as library}
		<li>
			{library.name} - {library.id} - {library.url}
			<nav class="library-nav">
				<a href="/library/{library.id}">edit</a>
				<a
					href="#"
					on:click={(e) => {
						deleteLibrary(e, library);
					}}>delete</a
				>
				<a
					href="#"
					on:click={(e) => {
						scan(e, library);
					}}>scan</a
				>
				{#if isScanning[library.id]}
					<Spinner color="#672ad6" />
				{/if}
				{#if scanProgress[library.id]}
					<span class="scan-status">
						{scanProgress[library.id].status}
					</span>
				{/if}
				{#if status[library.id]?.status}{status[library.id].status}{/if}
			</nav>

			{#if scans[library.id] && !isScanning[library.id] && scans[library.id].foundFiles?.length > 0}
				<details>
					<summary>Found {scans[library.id].foundFiles.length} files</summary>
					{#each scans[library.id].foundFiles as file}
						<div>{file.title}</div>
					{/each}
				</details>
			{/if}
		</li>
	{/each}
</ol>

<h2>Torrent Clients</h2>
<ol>
	{#each clients as item}
		<li>
			{item.name} - {item.id} - {item.url}
			<nav>
				<a href="/torrents/clients/{item.id}">edit</a>
				<a
					href="#"
					on:click={(e) => {
						deleteTorrentClient(e, item);
					}}>delete</a
				>
				{#if status[item.id]?.status}{status[item.id].status}{/if}
			</nav>
		</li>
	{/each}
</ol>

{#if phoneUnverified}
	<a href="/verify/phone">Verify your phone number</a>
{/if}

<style>
	li {
		margin-bottom: 1.2rem;
	}

	.library-nav {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.library-nav a:is(a, a:visited) {
		margin-right: 1.2rem;
	}

	.scan-status {
		color: #672ad6;
		font-weight: 500;
		margin-left: 0.5rem;
	}
</style>
