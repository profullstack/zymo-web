import { CookieJar } from 'tough-cookie';
import moment from 'moment-timezone';
import { Cookie } from 'tough-cookie';

const MLB_ID = '1';
const UA_IPAD =
	'AppleCoreMedia/1.0 ( iPad; compatible; 3ivx HLS Engine/2.0.0.382; Win8; x64; 264P AACP AC3P AESD CLCP HTPC HTPI HTSI MP3P MTKA)';
const UA_PC =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const UA_ANDROID = 'okhttp/3.12.1';
const API_URL = 'https://statsapi.mlb.com';
const MLB_TEAM_IDS =
	'108,109,110,111,112,113,114,115,116,117,118,119,120,121,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,158,159,160';
const AFFILIATE_TEAM_IDS = {
	'Arizona Diamondbacks': '419,516,2310,5368',
	'Atlanta Braves': '430,431,432,478',
	'Baltimore Orioles': '418,488,548,568',
	'Boston Red Sox': '414,428,533,546',
	'Chicago Cubs': '451,521,550,553',
	'Chicago White Sox': '247,487,494,580',
	'Cincinnati Reds': '416,450,459,498',
	'Cleveland Guardians': '402,437,445,481',
	'Colorado Rockies': '259,342,486,538',
	'Detroit Tigers': '106,512,570,582',
	'Houston Astros': '482,573,3712,5434',
	'Kansas City Royals': '541,565,1350,3705',
	'Los Angeles Angels': '401,460,559,561',
	'Los Angeles Dodgers': '238,260,456,526',
	'Miami Marlins': '479,554,564,4124',
	'Milwaukee Brewers': '249,556,572,5015',
	'Minnesota Twins': '492,509,1960,3898',
	'New York Mets': '453,505,507,552',
	'New York Yankees': '531,537,587,1956',
	'Oakland Athletics': '237,400,499,524',
	'Philadelphia Phillies': '427,522,566,1410',
	'Pittsburgh Pirates': '452,477,484,3390',
	'San Diego Padres': '103,510,584,4904',
	'San Francisco Giants': '105,461,476,3410',
	'Seattle Mariners': '403,515,529,574',
	'St. Louis Cardinals': '235,279,440,443',
	'Tampa Bay Rays': '233,234,421,2498',
	'Texas Rangers': '102,448,485,540',
	'Toronto Blue Jays': '422,424,435,463',
	'Washington Nationals': '426,436,534,547'
};
export default class MLBTV {
	constructor() {
		this.username = process.env.MLB_TV_USER;
		this.password = process.env.MLB_TV_PASS;
		this.jar = new CookieJar();
		this.login_url = 'https://ids.mlb.com/oauth2/aus1m088yK07noBfh356/v1/token';
		this.media_url = 'https://media-gateway.mlb.com/graphql';

		console.log(this.username, this.password);
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
		let username = this.username;
		let password = this.password;

		if (!username || !password) {
			return; // Exit the function if username or password is missing
		}

		const url = this.login_url;
		const headers = {
			'User-Agent': UA_ANDROID,
			'Content-Type': 'application/x-www-form-urlencoded'
		};

		const payload = new URLSearchParams({
			grant_type: 'password',
			username,
			password,
			scope: 'openid offline_access',
			client_id: '0oa3e1nutA1HLzAKG356'
		});

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: headers,
				body: payload
			});

			if (response.ok) {
				const data = await response.json();
				this.login_token = data['access_token'];
				this.login_token_expiry = new Date(
					Date.now() + data['expires_in'] * 1000
				).toISOString();
				await this.getDeviceSessionID();
			} else {
				const errorData = await response.json();
				console.error(errorData);
				let msg = 'Login failed';
				if (errorData['error_description']) {
					msg = errorData['error_description'];
				}

				console.error(msg);

				this.login_token = '';
				this.login_token_expiry = '';
				this.device_id = '';
				this.session_key = '';
				this.entitlements = '';
			}
		} catch (error) {
			console.error('Error during login:', error);
		}
	}

	async getDeviceSessionID() {
		const headers = {
			'User-Agent': UA_PC,
			Authorization: 'Bearer ' + this.login_token,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		const data = {
			operationName: 'initSession',
			query: `mutation initSession($device: InitSessionInput!, $clientType: ClientType!, $experience: ExperienceTypeInput) {
	    initSession(device: $device, clientType: $clientType, experience: $experience) {
	        deviceId
	        sessionId
	        entitlements {
	            code
	        }
	        location {
	            countryCode
	            regionName
	            zipCode
	            latitude
	            longitude
	        }
	        clientExperience
	        features
	    }
	}`,
			variables: {
				device: {
					appVersion: '7.8.2',
					deviceFamily: 'desktop',
					knownDeviceId: '',
					languagePreference: 'ENGLISH',
					manufacturer: 'Google Inc.',
					model: '',
					os: 'windows',
					osVersion: '10'
				},
				clientType: 'WEB'
			}
		};

		try {
			const response = await fetch(this.media_url, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(data)
			});

			if (response.ok) {
				const result = await response.json();
				const initSession = result.data.initSession;

				this.device_id = initSession.deviceId;
				this.session_key = initSession.sessionId;

				const entitlements = initSession.entitlements.map(
					(entitlement) => entitlement.code
				);
				this.entitlements = JSON.stringify(entitlements);
			} else {
				console.error('Failed to retrieve device session ID:', response.statusText);
			}
		} catch (error) {
			console.error('Error during get_device_session_id:', error);
		}
	}

	getEasternGameDate(timestamp) {
		// Convert timestamp to Eastern Time (ET)
		const eastern = timestamp.tz('America/New_York');

		// Get the hour in Eastern Time
		const easternHour = parseInt(eastern.format('HH'), 10);

		// Don't switch to the current day until 4:01 AM EST
		if (easternHour < 4) {
			eastern.subtract(1, 'day');
		}

		// Return the formatted date as 'YYYY-MM-DD'
		return eastern.format('YYYY-MM-DD');
	}

	localToEastern() {
		// Get the current UTC time and convert to Eastern
		return this.getEasternGameDate(moment.utc());
	}

	async getTodaysGames(gameDay = null, startInning = false, sport = MLB_ID, teams = null) {
		const today = this.localToEastern(); // Converts the current UTC time to Eastern Time (YYYY-MM-DD format)

		const url = `${API_URL}/api/v1/schedule?hydrate=broadcasts(all),game(content(media(epg))),probablePitcher,linescore,team,flags,gameInfo&sportId=${MLB_ID}&date=${today}&teamId=${MLB_TEAM_IDS}`;

		const headers = {
			'User-Agent': UA_ANDROID
		};

		console.log('Fetching URL:', url);

		let games = [];
		try {
			const response = await fetch(url, { headers });
			const jsonSource = await response.json();

			if (jsonSource.dates && jsonSource.dates.length > 0 && jsonSource.dates[0].games) {
				games = jsonSource.dates[0].games;
			}

			console.log('Games today:', games);
			return games; // Return the list of games for today
		} catch (error) {
			console.error('Error fetching games:', error);
			return [];
		}
	}

	async playStream(streamUrl, headers) {
		try {
			// Fetch the stream from the stream URL
			const response = await fetch(streamUrl, { headers });

			// Check if the response is OK (status code 200-299)
			if (!response.ok) {
				return new Response('Failed to fetch the stream.', { status: response.status });
			}

			return response.body;
			// // Return the fetch response directly
			// return new Response(response.body, {
			// 	headers: {
			// 		'Content-Type':
			// 			response.headers.get('Content-Type') || 'application/vnd.apple.mpegurl',
			// 		'Content-Length': response.headers.get('Content-Length')
			// 	},
			// 	status: response.status
			// });
		} catch (error) {
			console.error('Error playing stream:', error);
			return new Response('Internal Server Error', { status: 500 });
		}
	}

	async streamSelect(contentId) {
		try {
			// // Auto-select stream if a live broadcast is available
			// for (const item of epg) {
			// 	if (item.mediaState.mediaStateCode === 'MEDIA_ON' && item.type === 'TV') {
			// 		selectedContentId = item.mediaId;
			// 		break;
			// 	}
			// }

			// // If no live broadcast is found, select the first available archive
			// if (!selectedContentId) {
			// 	for (const item of epg) {
			// 		if (item.mediaState.mediaStateCode === 'MEDIA_ARCHIVE' && item.type === 'TV') {
			// 			selectedContentId = item.mediaId;
			// 			break;
			// 		}
			// 	}
			// }

			// Fetch the stream URL using the selectedContentId
			if (contentId) {
				return await this.getStream(contentId);

				// if (streamUrl.includes('.m3u8')) {
				// 	return this.playStream(streamUrl, headers); // Assuming playStream is a function to start playing the stream
				// } else {
				// 	console.error('Invalid stream URL');
				// }
			} else {
				console.error('No content id given');
			}
		} catch (error) {
			console.error('Error fetching stream:', error);
		}
	}

	async getStream(contentId) {
		// Check if device_id or session_key is empty and retrieve them if needed
		if (!this.device_id || !this.session_key) {
			await this.getDeviceSessionID(); // Assuming you have a method to retrieve and set deviceId and sessionKey
		}

		const headers = {
			'User-Agent': UA_PC,
			Authorization: `Bearer ${this.login_token}`, // Assuming this.loginToken() returns a valid token
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		const data = {
			operationName: 'initPlaybackSession',
			query: `mutation initPlaybackSession(
                $adCapabilities: [AdExperienceType]
                $mediaId: String!
                $deviceId: String!
                $sessionId: String!
                $quality: PlaybackQuality
            ) {
                initPlaybackSession(
                    adCapabilities: $adCapabilities
                    mediaId: $mediaId
                    deviceId: $deviceId
                    sessionId: $sessionId
                    quality: $quality
                ) {
                    playbackSessionId
                    playback {
                        url
                        token
                        expiration
                        cdn
                    }
                    adScenarios {
                        adParamsObj
                        adScenarioType
                        adExperienceType
                    }
                    adExperience {
                        adExperienceTypes
                        adEngineIdentifiers {
                            name
                            value
                        }
                        adsEnabled
                    }
                    heartbeatInfo {
                        url
                        interval
                    }
                    trackingObj
                }
            }`,
			variables: {
				adCapabilities: ['GOOGLE_STANDALONE_AD_PODS'],
				mediaId: contentId,
				quality: 'PLACEHOLDER', // Adjust this value as needed
				deviceId: this.device_id,
				sessionId: this.session_key
			}
		};

		try {
			const response = await fetch(this.media_url, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(data)
			});

			const result = await response.json();
			if (!response.ok) {
				const errors = result.errors.map((error) => error.code).join('\n');
				console.error('Error:', errors);
				throw new Error(errors);
			}

			console.log(JSON.stringify(result, null, 2));
			const streamUrl = result.data.initPlaybackSession?.playback.url;
			console.log(`Stream URL: ${streamUrl}`);

			// Simplified headers string
			const streamHeaders = `User-Agent=${UA_PC}`;
			return {streamUrl, streamHeaders};
		} catch (error) {
			console.error('Failed to get stream:', error);
			throw error;
		}
	}

	// async getGameSchedule() {
	// 	const today = moment().tz('America/Los_Angeles').format('YYYY/MM/DD');
	// 	const parts = today.split('/');
	// 	const pathToday = `year_${parts[0]}/month_${parts[1]}/day_${parts[2]}`;
	// 	const scheduleUrl = `${this.baseUrl}/components/game/mlb/${pathToday}/grid_ce.json`;

	// 	const response = await this.fetchWithCookies(scheduleUrl, {
	// 		headers: {
	// 			'User-Agent': 'MLBTV-JS'
	// 		}
	// 	});

	// 	return response.json();
	// }

	// async getLiveGames(schedule) {
	// 	let games = schedule.games.game || [];
	// 	if (!Array.isArray(games)) {
	// 		games = [games];
	// 	}

	// 	return games.filter(
	// 		(game) =>
	// 			game.media_state === 'media_on' &&
	// 			game.status !== 'Final' &&
	// 			game.status !== 'Game Over'
	// 	);
	// }

	// async getStreamUrl(eventId, contentId) {
	// 	const epoch_time_now = moment.tz('America/New_York').format('x');
	// 	const url = `${this.baseUrl}/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3?eventId=${eventId}&contentId=${contentId}&_=${epoch_time_now}`;

	// 	console.log('Fetching stream URL:', url);

	// 	const response = await this.fetchWithCookies(url, {
	// 		headers: {
	// 			'User-Agent': 'MLBTV-JS'
	// 		}
	// 	});

	// 	const data = await response.json();

	// 	if (data.status_code !== 1) {
	// 		console.error('Failed to retrieve stream URL:', data.status_message);
	// 		throw new Error(data.status_message);
	// 	}

	// 	let streamUrl =
	// 		data.user_verified_event[0].user_verified_content[0].user_verified_media_item[0].url;
	// 	streamUrl = streamUrl.replace(
	// 		'master_wired60',
	// 		`${this.quality}K/${this.quality}_complete`
	// 	);

	// 	return streamUrl;
	// }

	// async getLiveStreams() {
	// 	try {
	// 		await this.login();
	// 		const schedule = await this.getGameSchedule();
	// 		const liveGames = await this.getLiveGames(schedule);

	// 		const streams = await Promise.all(
	// 			liveGames.map((game) =>
	// 				this.getStreamUrl(game.calendar_event_id, game.game_media.homebase.media[0].id)
	// 			)
	// 		);

	// 		return streams;
	// 	} catch (err) {
	// 		console.error(err);
	// 	}
	// }
}
