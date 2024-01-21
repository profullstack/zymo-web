<script>
	import { createEventDispatcher } from 'svelte';

	let search = {
		query: '',
		priceRange: '',
		priceRangeMin: '',
		priceRangeMax: '',
		graphicsRam: [],
		mfr: [],
		interface: [],
	};

	const dispatch = createEventDispatcher();

	function onSubmit(e) {
		e.preventDefault();
		console.log(e);
		dispatch('search', { search });
	}
</script>

<nav>
	<form on:submit={onSubmit}>
		<fieldset>
			<legend>Search</legend>
			<div class="field">
				<label>
					<input
						type="text"
						name="query"
						bind:value={search.query}
						placeholder="Enter search keyword"
					/>
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Prices</legend>
			<div class="field">
				<label>
					<input
						type="radio"
						name="priceRange"
						bind:group={search.priceRange}
						value="<25"
					/> Under $25
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="radio"
						name="priceRange"
						bind:group={search.priceRange}
						value="25,50"
					/> $25 - $50
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="radio"
						name="priceRange"
						bind:group={search.priceRange}
						value="50,100"
					/> $50 - $100
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="radio"
						name="priceRange"
						bind:group={search.priceRange}
						value="100,200"
					/> $100 - $200
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="radio"
						name="priceRange"
						bind:group={search.priceRange}
						value="200+"
					/> $200 &amp; above
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="number"
						name="priceRangeMin"
						bind:value={search.priceRangeMin}
						placeholder="Min"
					/>
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="number"
						name="priceRangeMax"
						bind:value={search.priceRangeMax}
						placeholder="Max"
					/>
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Graphics Ram</legend>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="graphicsRam"
						bind:group={search.graphicsRam}
						value="GDDR3"
					/> GDDR3
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="graphicsRam"
						bind:group={search.graphicsRam}
						value="GDDR5"
					/> GDDR5
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="graphicsRam"
						bind:group={search.graphicsRam}
						value="GDDR6"
					/> GDDR6
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="graphicsRam"
						bind:group={search.graphicsRam}
						value="GDDR6X"
					/> GDDR6X
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Manufacturer</legend>
			<div class="field">
				<label>
					<input type="checkbox" name="mfr" bind:group={search.mfr} value="AMD" /> AMD
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="mfr" bind:group={search.mfr} value="Nvidia" /> Nvidia
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Video Output Interface</legend>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="DisplayPort"
					/> DisplayPort
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="DVI"
					/> DVI
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="HDMI"
					/> HDMI
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="Mini DisplayPort"
					/> Mini DisplayPort
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="PCI Express"
					/> PCI Express
				</label>
			</div>
			<div class="field">
				<label>
					<input
						type="checkbox"
						name="interface"
						bind:group={search.interface}
						value="VGA"
					/> VGA
				</label>
			</div>
		</fieldset>
		<footer>
			<button>Search</button>
		</footer>
	</form>
</nav>

<style>
	label,
	legend {
		white-space: nowrap;
	}
</style>
