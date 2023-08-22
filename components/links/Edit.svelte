<script>
    export let data;

    const { link } = data;
    let status;
    
    async function submit(e) {
      e.preventDefault();
      const res = await fetch(`/links/${link.id}`, {
        method: 'PUT',
        body: JSON.stringify(link),
        headers: {
          "Content-Type": "application/json",
        }, 
      });

      const result = await res.json();

      // status = result.status;
      data = result;

      console.log(result);
    }

  </script>
  
  <h1>Edit link</h1>

  <form on:submit={submit}>
    {data?.status ?? ""}
    <div><input name="url" placeholder="Enter url" required bind:value={link.url} /></div>
    <div>{data?.errors?.url ?? ""}</div>
    <div><input name="alias" placeholder="Enter alias (optional)" bind:value={link.alias}/></div>
    <div>{data?.errors?.alias ?? ""}</div>
    <div><button type="submit">
      Update
    </button></div>
  </form>
  
