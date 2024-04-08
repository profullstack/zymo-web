import { view } from "primate";

export default {

  async get(request) {

    const { store, session } = request;
    const { Product } = store


    const products = await Product.getAllProducts();

    return view("Products.svelte", { products });
  },

}