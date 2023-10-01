<script>
    export let status, errors;
  </script>

  <h1>Create an API key</h1>

  <form method="post">
    {status ?? ""}
    <div><input name="name" placeholder="Enter name" required /></div>
    <div>{errors?.name ?? ""}</div>
    <div><button type="submit">
      Create
    </button></div>
  </form>

