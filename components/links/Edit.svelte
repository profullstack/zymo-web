<script>
    export let data;
    
    async function submit(e) {
      e.preventDefault();
      const res = await fetch(`/links/${data.link?.id}`, {
        method: 'PUT',
        body: data,
      });

      const result = await res.json();
      console.log(result);
    }

  </script>
  
  <h1>Edit link</h1>

  <form on:submit={submit}>
    {data?.status ?? ""}
    <div><input name="url" placeholder="Enter url" required bind:value={data.link?.url} /></div>
    <div>{data?.errors?.url ?? ""}</div>
    <div><input name="alias" placeholder="Enter alias (optional)" bind:value={data.link?.alias}/></div>
    <div>{data?.errors?.alias ?? ""}</div>
    <div><button type="submit">
      Update
    </button></div>
  </form>
  