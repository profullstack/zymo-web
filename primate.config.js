import store from "@primate/store";
import surrealdb from "@primate/surrealdb";
import svelte from "@primate/svelte";

export default {
  modules: [
    store(surrealdb()),
    svelte(),
  ]
}
