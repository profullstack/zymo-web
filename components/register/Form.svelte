<script>
  
  export let status, errors;
</script>

<svelte:head>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.11.0/css/flag-icons.min.css"
/>
</svelte:head>

<h1>Register</h1>

<form method="post">
  {status ?? ""}
  <div><input name="email" type="email" placeholder="Enter email address"
    required /></div>
  <div>{errors?.email ?? ""}</div>
  <div><input name="username" placeholder="Enter username" required /></div>
  <div>{errors?.username ?? ""}</div>
  <div>
    <span class="fi fi-us">flag</span>
    <input name="phone" type="tel" placeholder="Enter phone number" />
  </div>
  <div>{errors?.phone ?? ""}</div>
  <div><input name="password" type="password" placeholder="Enter password"
    required /></div>
  <div>{errors?.password ?? ""}</div>
  <div><input name="password2" type="password" placeholder="Re-enter password"
    required /></div>
  <div>{errors?.password2 ?? ""}</div>
  <div><button type="submit">Register</button></div>
</form>
