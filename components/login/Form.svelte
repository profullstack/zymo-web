<script>
  export let next, status, errors;
</script>

<h1>Login</h1>

<form method="post">
  {#if next}
    <input type="hidden" name="next" value={next} />
  {/if}
  {status ?? ""}
  <div class="field"><input name="email" placeholder="Enter email address" /></div>
  <div>{errors?.email ?? ""}</div>
  <p><strong>-- or --</strong></p>
  <div class="field"><input name="phone" type="tel" placeholder="Enter phone number" /></div>
  <div>{errors?.phone ?? ""}</div>
  <div class="field"><input name="password" type="password" placeholder="Enter password"
    required /></div>
  <div>{errors?.password ?? ""}</div>
  <footer><button type="submit">Login</button></footer>
</form>

<p><a href="/reset">Forgot password?</a></p>