import { CookieJar } from 'tough-cookie';
import moment from 'moment-timezone';
import { Cookie } from 'tough-cookie';

export default class MLBTV {
	constructor() {
		this.username = process.env.MLB_TV_USER;
		this.password = process.env.MLB_TV_PASS;
		this.jar = new CookieJar();
		this.baseUrl = 'https://mlb-ws-mf.media.mlb.com';
	}

	async fetchWithCookies(url, options = {}) {
		const cookieHeader = this.jar.getCookieStringSync(url);
		const headers = {
			...options.headers,
			Cookie: cookieHeader
		};
		const response = await fetch(url, { ...options, headers });
		const setCookies = response.headers.get('set-cookie');
		if (setCookies) {
			setCookies.split(',').forEach((cookieStr) => {
				this.jar.setCookieSync(Cookie.parse(cookieStr), url);
			});
		}
		return response;
	}

	async login() {
		console.log('Logging in...');
		const loginUrl = `${this.baseUrl}/authenticate.do`;

		try {
			const response = await this.fetchWithCookies(loginUrl, {
				method: 'POST',
				body: new URLSearchParams({
					uri: '/account/login_register.jsp',
					registrationAction: 'identify',
					emailAddress: this.username,
					password: this.password
				}),
				headers: {
					'User-Agent': 'MLBTV-JS',
					Referer: 'http://www.mlb.com',
					Origin: 'https://securea.mlb.com',
					Connection: 'keep-alive'
				},
				redirect: 'manual'
			});

			const data = await response.text();
			if (data.includes('Welcome to the New MLB.TV Media Player')) {
				console.log('Login successful');
			} else {
				throw new Error('Login Error');
			}
		} catch (err) {
			console.error('Unable to login', err);
			throw err;
		}
	}

	async getGameSchedule() {
		const today = moment().tz('America/Los_Angeles').format('YYYY/MM/DD');
		const parts = today.split('/');
		const pathToday = `year_${parts[0]}/month_${parts[1]}/day_${parts[2]}`;
		const scheduleUrl = `${this.baseUrl}/components/game/mlb/${pathToday}/grid_ce.json`;

		const response = await this.fetchWithCookies(scheduleUrl, {
			headers: {
				'User-Agent': 'MLBTV-JS'
			}
		});

		return response.json();
	}

	async getLiveGames(schedule) {
		let games = schedule.games.game || [];
		if (!Array.isArray(games)) {
			games = [games];
		}

		return games.filter(
			(game) =>
				game.media_state === 'media_on' &&
				game.status !== 'Final' &&
				game.status !== 'Game Over'
		);
	}

	async getStreamUrl(eventId, contentId) {
		const epoch_time_now = moment.tz('America/New_York').format('x');
		const url = `${this.baseUrl}/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3?eventId=${eventId}&contentId=${contentId}&_=${epoch_time_now}`;

		console.log('Fetching stream URL:', url);

		const response = await this.fetchWithCookies(url, {
			headers: {
				'User-Agent': 'MLBTV-JS'
			}
		});

		const data = await response.json();

		if (data.status_code !== 1) {
			console.error('Failed to retrieve stream URL:', data.status_message);
			throw new Error(data.status_message);
		}

		let streamUrl =
			data.user_verified_event[0].user_verified_content[0].user_verified_media_item[0].url;
		streamUrl = streamUrl.replace(
			'master_wired60',
			`${this.quality}K/${this.quality}_complete`
		);

		return streamUrl;
	}

	async getLiveStreams() {
		try {
			await this.login();
			const schedule = await this.getGameSchedule();
			const liveGames = await this.getLiveGames(schedule);

			const streams = await Promise.all(
				liveGames.map((game) =>
					this.getStreamUrl(game.calendar_event_id, game.game_media.homebase.media[0].id)
				)
			);

			return streams;
		} catch (err) {
			console.error(err);
		}
	}
}

