import {view} from "primate";

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link },
			apikeys: { Apikey },
		} = store;

	const userId = session.get().user.id
    const links = await Link.getAllByUserId(userId);
	const apikeys = await Apikey.getAllByUserId(userId)

    console.log('links2:', links, apikeys);
    
    return view("Dashboard.svelte", { links, apikeys });
  },
};
