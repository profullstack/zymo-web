import {view} from "primate";

export default {
	async get(request) {
        const { session, path, store } = request;

	    // const userId = session.get('user').id;

        return view("prices/Index.svelte", {  });
  }
};
