import view from "primate/handler/view";

export default {

  async get(request) {

    return view('admin/db/Index.svelte');
  },
}