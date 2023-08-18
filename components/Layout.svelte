<script>
  import NavBar from "./NavBar.svelte";

  export let data;
</script>


<NavBar data />

<div>
  T{data.hello}T This is a layout
  <slot />
</div>
