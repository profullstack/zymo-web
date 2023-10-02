<script>
  export let next, status, errors;
</script>

<h1>Login</h1>

<form method="post">
  {status ?? ""}
  <div><input name="email" placeholder="Enter email address" required /></div>
  <div>{errors?.email ?? ""}</div>
  <div><button type="submit">Reset password</button></div>
</form>
