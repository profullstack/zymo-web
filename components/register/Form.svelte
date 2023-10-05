<script>
  import CountrySelect from "../CountrySelect.svelte";
  export let status, errors, countries;
</script>

<svelte:head>
<link
  rel="stylesheet"
  href="/static/flags.css"
/>
</svelte:head>

<h1>Register</h1>

<form method="post">
  {status ?? ""}
  <div class="field">
    <input name="firstName" type="text" placeholder="Enter first name"
    required />
  </div>
  <div>{errors?.firstName ?? ""}</div>
  <div class="field">
    <input name="lastName" type="text" placeholder="Enter last name"
    required />
  </div>
  <div>{errors?.lastName ?? ""}</div>
  <div class="field">
    <input name="email" type="email" placeholder="Enter email address"
    required />
  </div>
  <div>{errors?.email ?? ""}</div>
  <div class="field">
    <input name="username" placeholder="Enter username" required />
  </div>
  <div>{errors?.username ?? ""}</div>
  <div class="field row">
    <CountrySelect countries={countries} status={status} errors={errors} />
    <input name="phone" type="tel" placeholder="Enter phone number" required />
  </div>
  <div>{errors?.phone ?? ""}</div>
  <div class="field">
    <input name="password" type="password" placeholder="Enter password"
    required />
  </div>
  <div>{errors?.password ?? ""}</div>
  <div class="field">
    <input name="password2" type="password" placeholder="Re-enter password"
    required />
  </div>
  <div>{errors?.password2 ?? ""}</div>
  <footer><button type="submit">Register</button></footer>
</form>

