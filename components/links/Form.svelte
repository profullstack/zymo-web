<script>
    export let status, errors;
  </script>

  <h1>Create a link</h1>

  <form method="post">
    {status ?? ""}
    <div><input name="url" placeholder="Enter url" required /></div>
    <div>{errors?.url ?? ""}</div>
    <div><input name="alias" placeholder="Enter alias (optional)" /></div>
    <div>{errors?.alias ?? ""}</div>
    <div><button type="submit">
      Create
    </button></div>
  </form>

