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

	async function scan(e, library, save = 0) {
		isScanning[library.id] = true;
		e.preventDefault();
		try {
			const url =
				`/api/parsers/html?url=${library.url}&id=${library.id}` +
				(library.user && library.pass ? `&user=${library.user}&pass=${library.pass}` : '') +
				(save ? `&save=1` : '');
			const res = await fetch(url);
			const result = await res.json();
			scans[library.id] = result;
		} catch (err) {
			status[library.id] = err;
		} finally {
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
				{#if status[library.id]?.status}{status[library.id].status}{/if}
			</nav>

			{#if scans[library.id]}
				<h4>Found ${scans[library.id].foundFiles?.length} files</h4>
				{#each scans[library.id].foundFiles as file}
					<div>{file.title}</div>
				{/each}
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
</style>
