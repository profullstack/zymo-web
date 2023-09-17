<script>
  import GlobalNavBar from "./GlobalNavBar.svelte";
  import NavBar from "./NavBar.svelte";

  export let isLoggedIn;
</script>


<main>
  <GlobalNavBar {isLoggedIn} />

            <div>
    {#if isLoggedIn}
      <NavBar {isLoggedIn} />
    {/if}
    <slot />
  </div>
</main>
