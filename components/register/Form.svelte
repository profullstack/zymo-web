<script>
  export let data;
</script>

<h1>Register</h1>

<form method="post">
  <div><input name="email" type="email" placeholder="Enter email address" /></div>
  <div><input name="text" placeholder="Enter username" /></div>
  <div><input name="phone" type="tel" placeholder="Enter phone number" /></div>
  <div><input name="password" type="password" placeholder="Enter password" /></div>
  <div><input name="password2" type="password" placeholder="Re-enter password" /></div>
  <div><button type="submit">Register</button></div>
  <div>{data?.errors?.email ?? ""}</div>
</form>
