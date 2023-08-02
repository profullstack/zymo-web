<script>
  export let data;
</script>

<h1>Login</h1>

<form method="post">
  <div><input name="email" placeholder="Enter email address" /></div>
  <div><button type="submit">Login</button></div>
  <div>{data?.errors?.email ?? ""}</div>
</form>
