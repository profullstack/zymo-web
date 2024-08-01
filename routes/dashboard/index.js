import {view} from "primate";

export default {
	async get(request) {
		const { session, store } = request;
		const {
			apikeys: { Apikey },
			m3u: { M3U }
		} = store;

	const userId = session.get('user').id
    const m3us = await M3U.getAllByUserId(userId);
	const apikeys = await Apikey.getAllByUserId(userId)

    console.log('m3us:', m3us, apikeys);
    
    return view("Dashboard.svelte", { m3us, apikeys });
  },
};
