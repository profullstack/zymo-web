<script>
  export let next, status, errors;
</script>

<h1>Login</h1>

<form method="post">
  {#if next}
    <input type="hidden" name="next" value={next} />
  {/if}
  {status ?? ""}
  <div><input name="email" placeholder="Enter email address" required /></div>
  <div>{errors?.email ?? ""}</div>
  <div><input name="password" type="password" placeholder="Enter password"
    required /></div>
  <div>{errors?.password ?? ""}</div>
  <div><button type="submit">Login</button></div>
  <div>{errors?.email ?? ""}</div>
</form>
