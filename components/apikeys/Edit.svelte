<script>
    export let link, status, errors;

    async function submit(e) {
      e.preventDefault();
      const res = await fetch(`/apikeys/${apikey.id}`, {
        method: 'PUT',
        body: JSON.stringify(link),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      status = result.status;

      console.log(result);
    }

  </script>

  <h1>Edit API key</h1>

  <form on:submit={submit}>
    {status ?? ""}
    <div><input name="name" placeholder="Enter name" required bind:value={link.alias}/></div>
    <div>{errors?.name ?? ""}</div>
    <div><button type="submit">
      Update
    </button></div>
  </form>
