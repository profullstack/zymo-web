<script>
	import Hls from 'hls.js';

	export let games = [];
	export let providers = [];

	let status = {};
	let selectedStreamUrl = null;
	let selectedHeaders = null;
	let proxy = true;
	let login_token = null;

	async function deleteProvider(e, provider) {
		e.preventDefault();
		console.log('deleting:', provider);

		try {
			const res = await fetch(`/streaming/mlb/account/${provider.id}`, {
				method: 'DELETE'
			});

			const result = await res.json();
			status[provider.id] = result;
			e.target.closest('li').remove();
		} catch (err) {
			status[provider.id] = err;
		}
	}
	// Function to play the selected stream
	async function playStream(url, login_token) {
		url =
			url.includes('m3u8') ||
			url.includes('mp4') ||
			url.includes('mov') ||
			url.includes('mkv')
				? url
				: `${url}.m3u8`;

		if (proxy) {
			url = `/proxy?url=${encodeURIComponent(url)}&provider=mlb&login_token=${encodeURIComponent(login_token)}`;
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
			const response = await fetch(`/api/providers/mlb/play?contentId=${contentId}`);
			if (response.ok) {
				const data = await response.json();
				selectedStreamUrl = data.streamUrl;
				selectedHeaders = data.streamHeaders;
				login_token = data.login_token;
				playStream(selectedStreamUrl, login_token);
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

	function hasGameStarted(gameDate) {
		const gameStartTime = new Date(gameDate);
		const currentTime = new Date();

		// Subtract 15 minutes (900,000 milliseconds) from the game start time
		const adjustedGameStartTime = new Date(gameStartTime.getTime() - 15 * 60 * 1000);

		// Return true if the current time is after the adjusted game start time
		return currentTime >= adjustedGameStartTime;
	}
</script>

<h2>Existing accounts</h2>
<nav>
	<a href="/streaming/mlb/new">Add an MLB.tv account</a>
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

<h2>Today's games</h2>

<ul>
	{#each games as game}
		<li>
			<div>
				<strong>{game.teams.away.team.name}</strong> vs
				<strong>{game.teams.home.team.name}</strong>
				<span> - {formatTime(game.gameDate)}</span>
			</div>
			{#if hasGameStarted(game.gameDate) && game.status.abstractGameState !== 'Final' && game.status.abstractGameState !== 'Game Over'}
				<div>
					{#each game.broadcasts as broadcast}
						<button on:click={() => fetchStreamUrl(broadcast.mediaId)}>
							{broadcast.homeAway === 'home' ? 'Home' : 'Away'} - {broadcast.type ===
							'TV'
								? 'TV'
								: 'Radio'} ({broadcast.callSign})
						</button>
					{/each}
				</div>
			{/if}
		</li>
	{/each}
</ul>

<video id="video" width="640" height="360" controls>
	Your browser does not support the video tag.
</video>
