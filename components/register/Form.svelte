<script>
  export let data;
</script>

<h1>Register</h1>

<form method="post">
  <div><input name="email" type="email" placeholder="Enter email address"
    required /></div>
  <div>{data?.errors?.email ?? ""}</div>
  <div><input name="username" placeholder="Enter username" required /></div>
  <div><input name="phone" type="tel" placeholder="Enter phone number" /></div>
  <div><input name="password" type="password" placeholder="Enter password"
    required /></div>
  <div><input name="password2" type="password" placeholder="Re-enter password"
    required /></div>
  <div><button type="submit">Register</button></div>
</form>
