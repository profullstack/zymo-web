<script>
    export let data;
  </script>
  
  <h1>Create a link</h1>
  
  <form method="post">
    {data?.status ?? ""}
    <div><input name="url" placeholder="Enter url" required /></div>
    <div>{data?.errors?.url ?? ""}</div>
    <div><input name="alias" placeholder="Enter alias (optional)" /></div>
    <div>{data?.errors?.alias ?? ""}</div>
    <div><button type="submit">Create</button></div>
  </form>
  