<script>
  export let data;
</script>

<h1>Login</h1>

<form method="post">
  {data?.status ?? ""}
  <div><input name="email" placeholder="Enter email address" required /></div>
  <div>{data?.errors?.email ?? ""}</div>
  <div><input name="password" type="password" placeholder="Enter password"
    required /></div>
  <div>{data?.errors?.password ?? ""}</div>
  <div><button type="submit">Login</button></div>
  <div>{data?.errors?.email ?? ""}</div>
</form>
