import view from "primate/handler/view";

export default {

  async get(request) {
    const { store } = request;
    const { Waitlist } = store;

    const waitlist = await Waitlist.getAll();
    return view('admin/db/Waitlist.svelte', { waitlist });
  },
}