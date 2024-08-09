import moment from 'moment-timezone';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import _ from 'lodash';

class MLB {
	constructor() {
		this.quality = 3500;
		this.name = 'MLB';
		this.slug = 'mlb';
		this.icon = 'mlb.png';
		this.username = process.env.MLB_TV_USER;
		this.password = process.env.MLB_TV_PASS;
		this.liveJsonFile = 'live-sports.json';
		this.jar = new CookieJar();
		this.client = wrapper(axios.create({ jar: this.jar }));
	}

	async getLiveStreams() {
		try {
			await this.login();
			const schedule = await this.getGameSchedule();
			const liveGames = await this.getLiveGames(schedule);
			const streamsWithIdentity = this.getIdentityPointAndFingerPrint(liveGames);
			const streamsWithSession = await this.getSessionKey(streamsWithIdentity);
			const streams = await this.getGameStreams(streamsWithSession);
			await this.logout();

			streams.forEach((stream) => {
				stream.agent = this.UA_PS4;
				stream.args = stream.args || {};
				stream.args['ignore-cookies'] = true;
				stream.icon = this.icon;
			});

			return streams;
		} catch (err) {
			console.error(err);
			await this.logout();
		}
	}

	async login() {
		console.log('Logging in...');

		try {
			const response = await this.client.post(
				'https://securea.mlb.com/authenticate.do',
				new URLSearchParams({
					uri: '/account/login_register.jsp',
					registrationAction: 'identify',
					emailAddress: this.username,
					password: this.password
				}),
				{
					headers: {
						'User-Agent': this.UA_PC,
						Referer: 'http://www.mlb.com',
						Origin: 'https://securea.mlb.com',
						Connection: 'keep-alive'
					},
					maxRedirects: 0,
					validateStatus: (status) => status >= 200 && status < 303
				}
			);

			if (response.data.includes('Welcome to the New MLB.TV Media Player')) {
				console.log('Login successful');
			} else {
				throw new Error('Login Error');
			}
		} catch (err) {
			console.error('Unable to login', err);
			throw err;
		}
	}

	async logout() {
		console.log('Logging out...');
		const url = 'https://secure.mlb.com/enterworkflow.do?flowId=registration.logout&c_id=mlb';

		try {
			const response = await this.client.post(
				url,
				{},
				{
					headers: {
						'User-Agent': this.UA_PC,
						Origin: 'http://mlb.mlb.com/index.jsp',
						Connection: 'close'
					}
				}
			);

			if (response.data.includes('Logout Confirmation')) {
				console.log('Logged out successfully.');
			}
		} catch (err) {
			console.error('Unable to logout', err);
		}
	}

	async getGameSchedule() {
		const today = moment().tz('America/Los_Angeles').format('YYYY/MM/DD');
		const parts = today.split('/');
		const pathToday = `year_${parts[0]}/month_${parts[1]}/day_${parts[2]}`;
		const scheduleUrl = `http://gdx.mlb.com/components/game/mlb/${pathToday}/grid_ce.json`;

		const response = await this.client.get(scheduleUrl, {
			headers: {
				'User-Agent': this.UA_PS4
			}
		});

		return response.data;
	}

	async getLiveGames(schedule) {
		const now_datetime_est = moment().tz('America/New_York');
		let games = schedule.data.games.game;
		let streams = [];

		if (!games) return streams;
		games = _.isArray(games) ? games : [games];

		games = games.filter(
			(game) =>
				game.media_state === 'media_on' &&
				game.status !== 'Final' &&
				game.status !== 'Game Over'
		);

		console.log('Found %d live games', games.length);

		games.forEach((game) => {
			const status = game.status;
			const eventId = game.calendar_event_id;
			const gameDay = eventId.split('-').slice(2).join('-');
			const away = game.away_team_name;
			const home = game.home_team_name;
			const awayCode = game.away_code;
			const homeCode = game.home_code;
			const gameDate = moment.tz(
				gameDay + ' ' + game['event_time'],
				'YYYY-MM-DD HH:mm A',
				'America/New_York'
			);
			const pregameStartTime = moment(gameDate)
				.tz('America/New_York')
				.subtract(15, 'minutes');
			const gameStartTime = moment(gameDate).tz('America/New_York');
			let epg = _.filter(game.game_media.homebase.media, {
				playback_scenario: 'HTTP_CLOUD_WIRED_60'
			});

			epg = epg.filter(
				(feed) => feed.type !== 'mlbtv_inmarket' && feed.blackout !== 'MLB_NON_US_BLACKOUT'
			);

			epg.forEach((feed) => {
				const contentId = feed.id;
				const type = feed.type.replace('mlbtv_', '');
				const stream = {};
				let title = 'MLB: ' + away + ' at ' + home;

				title += ' ' + _.capitalize(type);
				title += ' (' + gameStartTime.format('h:mma z') + ')';

				stream.title = title;
				stream.disabled = false;
				stream.epg = feed;
				stream.contentId = contentId;
				stream.eventId = eventId;
				stream.playbackScenario = feed.playback_scenario;
				stream.startTime = gameStartTime.format();
				stream.pregameTime = pregameStartTime.format();
				stream.isHomeFeed = type === 'home';
				stream.home = home;
				stream.away = away;
				stream.homeCode = homeCode;
				stream.awayCode = awayCode;
				stream.slug = 'mlb-';
				stream.slug += stream.isHomeFeed ? stream.homeCode : stream.awayCode;

				streams.push(stream);
			});
		});

		return streams;
	}

	getIdentityPointAndFingerPrint(streams) {
		const cookies = this.jar.getCookiesSync('http://mlb.com');
		let identityPointId;
		let fingerprint;

		cookies.forEach((c) => {
			if (c.key === 'ipid') {
				identityPointId = c.value;
			}

			if (c.key === 'fprt') {
				fingerprint = c.value;
			}
		});

		streams.forEach((stream) => {
			stream.identityPointId = identityPointId;
			stream.fingerprint = fingerprint;
		});

		return streams;
	}

	async getSessionKey(streams) {
		let sessionKey = this.getSessionKeyFromStore();

		if (sessionKey) {
			streams.forEach((stream) => {
				stream.sessionKey = sessionKey;
			});

			return streams;
		}

		if (!streams.length) {
			throw new Error('No live streams found');
		}

		const stream = streams[0];
		const epoch_time_now = moment.tz('America/New_York').format('x');
		const url = `https://mlb-ws-mf.media.mlb.com/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3?identityPointId=${stream.identityPointId}&fingerprint=${stream.fingerprint}&eventId=${stream.eventId}&subject=LIVE_EVENT_COVERAGE&platform=WIN8&frameworkURL=https://mlb-ws-mf.media.mlb.com&frameworkEndPoint=/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3&_=${epoch_time_now}`;

		const referer = `http://m.mlb.com/tv/e${stream.eventId}/v${stream.contentId}/?&media_type=video&clickOrigin=Media Grid&team=mlb&forwardUrl=http://m.mlb.com/tv/e${stream.eventId}/v${stream.contentId}/?&media_type=video&clickOrigin=Media%20Grid&team=mlb&template=mp5default&flowId=registration.dynaindex&mediaTypeTemplate=video`;

		console.log('Get session key', url);

		const response = await this.client.get(url, {
			headers: {
				'User-Agent': this.UA_PC,
				Origin: 'http://m.mlb.com',
				Referer: referer
			}
		});

		if (response.data.status_code === -3500) {
			console.log('Get session key failed:', response.data.status_message);
			throw new Error(response.data.status_message);
		}

		sessionKey = response.data.session_key;
		this.setSessionKeyInStore(sessionKey);

		streams.forEach((stream) => {
			stream.sessionKey = sessionKey;
		});

		return streams;
	}

	async getGameStreams(streams) {
		const results = await Promise.all(streams.map((stream, i) => this.getStreamUrl(stream, i)));

		return results.filter((stream) => stream);
	}

	async getStreamUrl(stream, i) {
		console.log('Get stream URL slug:', stream.slug);
		const delay = 1000;

		await new Promise((resolve) => setTimeout(resolve, i * delay));

		const epoch_time_now = moment.tz('America/New_York').format('x');
		const url = `https://mlb-ws-mf.media.mlb.com/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3?identityPointId=${stream.identityPointId}&fingerprint=${stream.fingerprint}&contentId=${stream.contentId}&eventId=${stream.eventId}&playbackScenario=${stream.playbackScenario}&subject=LIVE_EVENT_COVERAGE&sessionKey=${encodeURIComponent(stream.sessionKey)}&platform=PS4&format=json`;

		console.log('Get stream URL:', url);

		try {
			const response = await this.client.get(url, {
				headers: {
					'User-Agent': this.UA_PS4
				}
			});

			if (response.data.status_code === -3500) {
				console.log('Get stream URL failed:', response.data.status_message);
				throw new Error(response.data.status_message);
			}

			if (response.data.status_code === 1) {
				let streamUrl =
					response.data.user_verified_event[0].user_verified_content[0]
						.user_verified_media_item[0].url;
				streamUrl = streamUrl.replace(
					'master_wired60',
					`${this.quality}K/${this.quality}_complete`
				);
				stream.url = streamUrl;
				stream.sessionKey = response.data.session_key;
				stream = this.getMediaAuthFromCookies(stream);
				return stream;
			}
		} catch (err) {
			console.error('Fetch manifest URL:', err);
		}
	}

	getMediaAuthFromCookies(stream) {
		const cookies = this.jar.getCookiesSync('http://mlb.com');

		cookies.forEach((c) => {
			if (c.key === 'mediaAuth') {
				stream.mediaAuth = c.value;
			}
		});

		stream.cookie = `mediaAuth=${stream.mediaAuth}`;

		return stream;
	}

	getSessionKeyFromStore() {
		// Implement your logic to get the session key from the store
	}

	setSessionKeyInStore(sessionKey) {
		// Implement your logic to set the session key in the store
	}
}

const mlb = new MLB();

export async function getLiveStreams() {
	return await mlb.getLiveStreams();
}

export async function playStream(contentId) {
	const streams = await mlb.getLiveStreams();
	const stream = streams.find((s) => s.contentId === contentId);

	return stream.url;
}
