import { view } from "primate";

export default {

  async get(request) {
    const { store } = request;
    const { User } = store;

    const users = await User.getAll();
    return view('admin/data/Users.svelte', { users });
  },
}