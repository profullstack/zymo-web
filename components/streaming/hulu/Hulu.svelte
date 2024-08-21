<script>
	import Hls from 'hls.js';

	export let providers = [];

	let shows = [];
	let status = {};
	let selectedStreamUrl = null;
	let proxy = true;
	let q = '';

	let timeoutId;

	function handleSearch() {
		// Clear the previous timeout
		clearTimeout(timeoutId);

		// Set a new timeout to delay the search function
		timeoutId = setTimeout(() => {
			performSearch();
		}, 300); // Adjust the delay (in milliseconds) as needed
	}

	async function performSearch() {
		try {
			const res = await fetch('/api/providers/hulu/search?q=' + encodeURIComponent(q));

			if (res.ok) {
				shows = await res.json();
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function deleteProvider(e, provider) {
		e.preventDefault();
		console.log('deleting:', provider);

		try {
			const res = await fetch(`/streaming/hulu/account/${provider.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[provider.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[provider.id] = err;
		}
	}

	function _entityArt(artwork) {
		const art = { thumb: null, fanart: null };
		const thumbs = [
			'program.vertical.tile',
			'program.tile',
			'title.treatment.horizontal',
			'video.horizontal.hero',
			'network.tile',
			'team.tile'
		];
		const fanarts = [
			'detail.horizontal.wide',
			'detail.horizontal.hero',
			'network.tile',
			'team.tile'
		];

		function _image(path, type = 'thumb') {
			// Assuming this function processes the image path based on type
			return `${path}?type=${type}`;
		}

		for (let key of thumbs) {
			if (artwork[key]) {
				art.thumb = _image(artwork[key].path);
				break;
			}
		}

		for (let key of fanarts) {
			if (artwork[key]) {
				art.fanart = _image(artwork[key].path, 'fanart');
				break;
			}
		}

		return art;
	}

	function _image(url, _type = 'thumb') {
		let operations;

		if (_type === 'live') {
			operations = [
				{ trim: '(0,0,0,0)' },
				{ resize: '600x600|max' },
				{ extent: '600x600' },
				{ format: 'png' }
			];
		} else if (_type === 'fanart') {
			operations = [{ resize: '1920x1920|max' }, { format: 'jpeg' }];
		} else {
			operations = [{ resize: '600x600|max' }, { format: 'jpeg' }];
		}

		const cookie =
			'_hulu_at=eyJhbGciOiJSUzI1NiJ9.eyJhc3NpZ25tZW50cyI6ImV5SjJNU0k2VzExOSIsInJlZnJlc2hfaW50ZXJ2YWwiOjg2NDAwMDAwLCJ0b2tlbl9pZCI6ImIxMzJjY2FiLTNmMjQtNDQ1OS05MmY0LTA2NzBjMzI0NzdlZCIsImFub255bW91c19pZCI6ImJhMzUyYjEzLWFkNDEtNDhlNS04YjUyLTljMTA0N2IxMDIxNyIsImlzc3VlZF9hdCI6MTYzMTUwNjcwNTYwOCwidHRsIjozMTUzNjAwMDAwMCwiZGV2aWNlX3VwcGVyIjoxfQ.rzn7mJF2gsB-8nEi6TEUtWnt8bztjmP3vHGzo_XBa6yX1q8_sMJ8GoK0-_p5j8Rn65wZdaAYfTrK5TKg-e1upjZOwfOFNJucFZkJKLcn-ZtKoHDJoRi22RSnJMtHzKLfk020K_jDv8x_-ZQGKm86P2aqnOERUvKVr7sd7JvsH0QV5shlFuK6l-L90LDhZMm6MWJu5WV2jYmbmezpxm4DsWDc3hV6HgR_4rwibmW1X99l99e-g99eIBjvx6kihGvNcWgxNvYaUIvH5p-Bpx94H4BsH3NXtLd1OXsa851liEtu8LWjGuCb5b_RMz7GP3YiXb56Ao6sejuMr0ym8II5Ng;';

		const operationsEncoded = encodeURIComponent(JSON.stringify(operations));
		const cookieEncoded = encodeURIComponent(cookie);

		return `https://img.hulu.com/user/v3/artwork/${url.split('/').pop()}&operations=${operationsEncoded}|cookie=${cookieEncoded}`;
	}

	function _viewArt(artwork) {
		const art = { thumb: null, fanart: null };
		const thumbs = ['vertical_tile', 'horizontal_tile', 'horizontal', 'horizontal_network'];
		const fanarts = ['horizontal', 'horizontal_video', 'horizontal_network'];

		for (let key of thumbs) {
			if (artwork[key] && artwork[key].artwork_type === 'display_image') {
				art.thumb = _image(artwork[key].image.path);
				break;
			}
		}

		for (let key of fanarts) {
			if (artwork[key] && artwork[key].artwork_type === 'display_image') {
				art.fanart = _image(artwork[key].image.path, 'fanart');
				break;
			}
		}

		return art;
	}

	// Function to play the selected stream
	async function playStream(url) {
		url =
			url.includes('m3u8') ||
			url.includes('mp4') ||
			url.includes('mov') ||
			url.includes('mkv')
				? url
				: `${url}.m3u8`;

		if (proxy) {
			url = `/proxy?url=${encodeURIComponent(url)}&provider=hulu`;
		}

		const video = document.getElementById('video');
		video.muted = false;
		video.volume = 1.0;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url);
			hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				video.play();
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = url;
			video.addEventListener('loadedmetadata', () => {
				video.play();
			});
		} else {
			console.error('This device does not support HLS.');
		}
	}

	async function fetchStreamUrl(contentId) {
		try {
			// const response = mlbTv.streamSelect(contentId);
			const response = await fetch(`/api/providers/hulu/play?contentId=${contentId}`);
			if (response.ok) {
				const data = await response.json();
				selectedStreamUrl = data.streamUrl;
				playStream(selectedStreamUrl);
			} else {
				console.error('Failed to fetch stream URL');
			}
		} catch (error) {
			console.error('Error fetching stream URL:', error);
		}
	}

	function formatTime(utcTime) {
		const date = new Date(utcTime);
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			timeZoneName: 'short'
		});
	}
</script>

<h2>Existing accounts</h2>
<nav>
	<a href="/streaming/hulu/new">Add a Hulu account</a>
</nav>

<ul>
	{#each providers as provider}
		<li>
			{provider.username} -
			<a href="/streaming/{provider.provider}/account/{provider.id}">edit</a>
			<a
				href="#"
				on:click={(e) => {
					deleteProvider(e, provider);
				}}>delete</a
			>
			{#if status[provider.id]?.status}{status[provider.id].status}{/if}
		</li>
	{/each}
</ul>

<form>
	<div class="field">
		<label
			>Search <input
				type="text"
				bind:value={q}
				on:input={handleSearch}
				placeholder="ie: ESPN"
			/></label
		>
	</div>
</form>

<ul>
	{#each shows as show}
		<li>
			<strong>Title:</strong>
			{show.visuals.headline.text}<br />
			<img
				src={_viewArt(show.visuals.artwork).thumb}
				alt="{show.visuals.headline.text} Artwork"
				width="200"
			/><br />
			<strong>EAB:</strong>
			<a
				href="#"
				on:click|preventDefault={() => {
					fetchStreamUrl(show.actions.context_menu.actions[0].eab);
				}}>{show.actions.context_menu.actions[0].eab}</a
			><br />
			{#if show.visuals.short_subtitle}
				<strong>Subtitle:</strong> {show.visuals.short_subtitle.text}<br />
			{/if}
		</li>
	{/each}
</ul>

<video id="video" width="640" height="360" controls>
	Your browser does not support the video tag.
</video>
