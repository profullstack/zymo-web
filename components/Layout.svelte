<script>
  import GlobalNavBar from "./GlobalNavBar.svelte";
  import NavBar from "./NavBar.svelte";

  export let data;
</script>


<main>
  <GlobalNavBar {data} />

            <div>
    {#if data.isLoggedIn}
      <NavBar {data} />
    {/if}
    <slot />
  </div>
</main>
