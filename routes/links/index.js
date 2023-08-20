import {view, redirect} from "primate";

export default {
  get(request) {
    const {session} = request;
  },
  async post(request) {
    const {session, store} = request;
  },
};
