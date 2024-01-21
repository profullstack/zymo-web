<script>
	export let results = [];
</script>

<table>
	<thead>
		<tr>
			<th></th>
			<th>Title</th>
			<th>Price</th>
			<th>Rating</th>
			<th>Availability</th>
		</tr>
	</thead>
	<tbody>
		{#each results as item}
			<tr>
				<td><a href={item.link}><img src={item.image} alt="" /></a></td>
				<td><a href={item.link}>{item.title}</a></td>
				<td>
					{#if item.price}
						{item.price.raw}
					{:else if item.prices?.length}
						{item.prices.pop().raw}
					{/if}
				</td>
				<td>{item.rating ?? 'None'}</td>
				<td>{item.availability ? item.availability.raw : 'Unknown'}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		border-collapse: collapse;
	}
	tr td,
	tr th {
		text-align: left;
	}

	tr td {
		padding: 0.8rem;
	}

	td img {
		width: 10rem;
	}
</style>
