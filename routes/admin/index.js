import { view } from "primate";

export default {

  async get(request) {

    return view('admin/Index.svelte');
  },
}