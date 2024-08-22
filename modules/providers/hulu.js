import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import qs from 'qs';

export default class HuluAPI {
	constructor() {
		this.API_URL = 'https://discover.hulu.com';
		this.AUTH_URL = 'https://auth.hulu.com';
		this.userdata = {}; // Placeholder for user data
	}

	async login(email, password) {
		console.log('hulu creds:', email, password);
		try {
			const serial = this._getSerial();
			console.log(serial);
			const payload = {
				user_email: email,
				password: password,
				serial_number: serial,
				friendly_name: 'nodejs',
				device_id: 166
			};

			const data = qs.stringify(payload);

			const config = {
				method: 'post',
				maxBodyLength: Infinity,
				url: `${this.AUTH_URL}/v2/livingroom/password/authenticate`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: data
			};

			try {
				const response = await axios.request(config);
				console.log('Login successful:', response.data);
				this._setAuth(response.data.data);
			} catch (error) {
				console.error('Error:', error.message);
			}
		} catch (error) {
			console.error('Login error:', error);
		}
	}

	_setAuth(data) {
		console.log('_setAuth:', data);
		this.userdata.user_token = data.user_token;
		this.userdata.device_token = data.device_token;
	}

	_getSerial() {
		const macAddress = uuidv4();
		return `0000${crypto.createHash('md5').update(macAddress).digest('hex')}`;
	}

	async search(query) {
		console.log(this.userdata, '<< token');
		try {
			const params = new URLSearchParams({
				language: 'en',
				search_query: query,
				limit: 10,
				type: 'entity'
			});

			const response = await axios.get(`${this.API_URL}/content/v5/search/entity`, {
				params,
				headers: {
					Authorization: `Bearer ${this.userdata.user_token}`
				}
			});

			console.log('search results:', response.data);
			return response.data.groups[0].results;
		} catch (error) {
			console.error('Search error:', error.message);
		}
	}

	async playback(bundle) {
		const isLive =
			'content_type' in bundle
				? bundle.content_type === 'LIVE'
				: bundle.bundle_type !== 'VOD';

		const avFeatures = bundle.av_features || [];

		const vidTypes = [
			{
				type: 'H264',
				width: 3840,
				height: 2160,
				framerate: 60,
				level: '4.2',
				profile: 'HIGH'
			}
		];
		if (this._getSetting('h265')) {
			vidTypes.push({
				type: 'H265',
				width: 3840,
				height: 2160,
				framerate: 60,
				level: '5.1',
				profile: 'MAIN_10',
				tier: 'MAIN'
			});
		}

		let audTypes = [{ type: 'AAC' }];

		if (isLive && avFeatures.includes('5.1')) {
			audTypes = [{ type: 'AAC' }]; // Only AAC for live 5.1 audio
		} else {
			audTypes.push({ type: 'EC3' }); // Include EC3 for non-live or other cases
		}

		const secondaryAudio = false;
		const patchUpdates = true; // Needed for live to work
		const liveSegmentDelay = 3;

		const payload = {
			content_eab_id: bundle.eab_id,
			play_intent: 'resume', // Options: live, resume, restart
			unencrypted: true,
			all_cdn: false,
			ignore_kids_block: false,
			device_identifier: this._getSerial(),
			deejay_device_id: this.DEVICE_ID,
			version: this.DEVICE_KEY_VERSION,
			include_t2_rev_beacon: false,
			include_t2_adinteraction_beacon: false,
			support_brightline: false,
			support_innovid: false,
			support_innovid_truex: false,
			support_gateway: false,
			limit_ad_tracking: true,
			network_mode: 'Ethernet',
			enable_selectors: false,
			playback: {
				version: 2,
				video: {
					codecs: {
						values: vidTypes,
						selection_mode: 'ALL'
					}
				},
				audio: {
					codecs: {
						values: audTypes,
						selection_mode: 'ALL'
					}
				},
				drm: {
					values: [
						{
							type: 'WIDEVINE',
							version: 'MODULAR',
							security_level: true ? 'L1' : 'L3'
						}
					],
					selection_mode: 'ALL'
				},
				manifest: {
					type: 'DASH',
					https: true,
					multiple_cdns: false,
					patch_updates: patchUpdates,
					hulu_types: false,
					live_dai: false,
					multiple_periods: false,
					xlink: false,
					secondary_audio: secondaryAudio,
					live_fragment_delay: liveSegmentDelay
				},
				trusted_execution_environment: true,
				segments: {
					values: [
						{
							type: 'FMP4',
							encryption: {
								mode: 'CENC',
								type: 'CENC'
							},
							https: true
						}
					],
					selection_mode: 'ONE'
				}
			}
		};

		const useHDR10 = true; // Default to true
		const useDolbyVision = false; // Default to false
		const hdcpRequired = true; // Assume HDCP 2.2 is required

		if ((useHDR10 || useDolbyVision) && hdcpRequired) {
			payload.playback.video.dynamic_range = useHDR10 ? 'HDR' : 'DOLBY_VISION';
			payload.playback.drm.multi_key = true;
		}

		Object.assign(payload, this._getLatLong());

		try {
			const response = await axios.post(`${this.API_URL}/playlist`, payload, {
				headers: {
					Authorization: `Bearer ${this.userdata.user_token}`,
					'Content-Type': 'application/json'
				}
			});
			return response.data;
		} catch (error) {
			console.error('Error playing content:', error);
			throw error;
		}
	}

	async play(id, play_type = null, kwargs = {}) {
		return this._play(id, play_type, kwargs);
	}

	async _play(id, play_type, kwargs) {
		if (!id.includes('::') || id.endsWith('::NULL')) {
			const result = await this.deeplink(id.replace('EAB::', '').split(':')[0]);
			console.log(result, '<< deeplink entity id');
			if (!result) {
				throw new Error(`No entity found for ${id}`);
			}
			id = result;
		}

		const entities = await this.getEntities([id]);
		if (!entities || !entities[0].bundle) {
			throw new Error(`No entity found for ${id}`);
		}

		const entity = entities[0];
		const data = await this.playback(entity.bundle);

		const item = {
			path: data.stream_url,
			inputstream: {
				license_key: data.wv_server
			},
			headers: {} // Replace with your headers if needed
		};

		if (kwargs.liveTag) {
			play_type = play_type !== null ? parseInt(play_type, 10) : this.getLivePlayType();

			if (play_type === 0) {
				item.resume_from = 1;
			} else if (play_type === 1) {
				item.resume_from = await this.liveOrStart();
				if (item.resume_from === -1) return;
			}

			if (!item.resume_from) {
				item.resume_from = 'LIVE_HEAD'; // Replace with your actual value
			}
		}

		if (data.transcripts_urls) {
			item.subtitles = Object.entries(data.transcripts_urls.webvtt || {}).map(
				([key, url]) => [url, key]
			);
		}

		if (data.asset_playback_type === 'VOD' && this.shouldSyncPlayback()) {
			if (data.initial_position && kwargs.noResume && !kwargs.resumeTag) {
				item.resume_from = await this.resumeFrom(Math.floor(data.initial_position / 1000));
				if (item.resume_from === -1) return;
			}

			item.callback = {
				type: 'interval',
				interval: 30,
				callback: `update_progress?eab_id=${entity.bundle.eab_id}`
			};
		}

		return item;
	}

	async _getLatLong() {
		return { lat: 37.7749, long: -122.4194 }; // San Francisco, CA
	}

	async deeplink(id) {
		console.log('deeplink id:', id);
		try {
			const params = {
				id: id,
				namespace: 'entity',
				schema: 1,
				...this._getLatLong() // Include latitude and longitude if needed
			};

			const response = await axios.get(`${this.API_URL}/content/v5/deeplink/playback`, {
				params,
				headers: {
					Authorization: `Bearer ${this.userdata.user_token}`
				}
			});

			console.log(response.data, '<< deeplink');
			return response.data.id;
		} catch (error) {
			console.error('Error fetching deeplink:', error.message);
			throw new Error('Failed to retrieve deeplink');
		}
	}

	async getEntities(eab_ids) {
		// Simulate an API call to get entities

		const params = {
			language: 'en',
			eab_ids: eab_ids.join(','), // Join the array into a comma-separated string
			...this._getLatLong() // Add latitude and longitude if needed
		};

		try {
			const response = await axios.get(`${this.API_URL}/content/v3/entity`, {
				params,
				headers: {
					Authorization: `Bearer ${this.userdata.user_token}`
				}
			});

			console.log(JSON.stringify(response.data, null, 2), '<< getEntities');
			return response.data.items;
		} catch (error) {
			console.error('Error fetching entities:', error);
			throw error;
		}
	}

	async getPlaybackData(bundle) {
		console.log(bundle, '<< bundle');
		try {
			const response = await axios.post(
				'https://play.hulu.com/v6/playlist',
				{
					bundle_id: bundle.eab_id
					// Include any other required parameters for the API request
				},
				{
					headers: {
						Authorization: `Bearer ${this.userdata.user_token}`,
						'Content-Type': 'application/json'
					}
				}
			);

			// Assume response data is structured similarly to your simulated data
			const data = response.data;

			return {
				stream_url: data.stream_url,
				wv_server: data.wv_server,
				transcripts_urls: data.transcripts_urls || {},
				asset_playback_type: data.asset_playback_type,
				initial_position: data.initial_position || 0
			};
		} catch (error) {
			console.error('Error fetching playback data:', error.message);
			throw new Error('Failed to retrieve playback data');
		}
	}

	async liveOrStart() {
		// Simulate user choice for live or start
		return 0;
	}

	getLivePlayType() {
		// Simulate getting a setting value
		return 1; // Example: 1 means "ask"
	}

	shouldSyncPlayback() {
		// Simulate checking a setting
		return true;
	}

	async resumeFrom(position) {
		// Simulate a resume function
		return position;
	}
}
