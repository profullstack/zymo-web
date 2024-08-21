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
				url: 'https://auth.hulu.com/v2/livingroom/password/authenticate',
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

			const response = await fetch(
				`${this.API_URL}/content/v5/search/entity?${params.toString()}`,
				{
					headers: { Authorization: `Bearer ${this.userdata.user_token}` }
				}
			);

			if (!response.ok) {
				console.error(await response.json());
				throw new Error('Search failed');
			}

			const data = await response.json();
			console.log('search results:', data);
			return data.groups[0].results;
		} catch (error) {
			console.error('Search error:', error.message);
		}
	}

	async play(eab_id) {
		try {
			const payload = {
				content_eab_id: eab_id,
				play_intent: 'resume',
				unencrypted: true,
				device_identifier: this._getSerial()
			};

			console.log('play payload', payload);

			const response = await fetch('https://play.hulu.com/v6/playlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.userdata.user_token}`
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				console.error(await response.text());
				throw new Error('Play request failed');
			}

			const data = await response.json();
			console.log('Play response:', data);
			return data;
		} catch (error) {
			console.error('Play error:', error.message);
		}
	}
}
