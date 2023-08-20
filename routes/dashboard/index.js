import {view} from "primate";

export default {
	async get(request) {
		const { session, path, store } = request;
		const {
			link: { Link }
		} = store;
    const links = await Link.getAllByUserId(session.get().user.id);

    console.log('links2:', links);
    
    return view("Dashboard.svelte", { links });
  },
};
