<nav>
	<form>
		<fieldset>
			<legend>Search</legend>
			<div class="field">
				<label>
					<input type="text" name="search" value="" placeholder="Enter search"/>
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>GPU Type</legend>
			<div class="field">
				<label>
					<input type="checkbox" name="type" value="desktop" /> Desktop
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="type" value="server" /> Server
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Prices</legend>
			<div class="field">
				<label>
					<input type="radio" name="priceRange" value="<25" /> Under $25
				</label>
			</div>
			<div class="field">
				<label>
					<input type="radio" name="priceRange" value="25,50" /> $25 - $50
				</label>
			</div>
			<div class="field">
				<label>
					<input type="radio" name="priceRange" value="50,100" /> $50 - $100
				</label>
			</div>
			<div class="field">
				<label>
					<input type="radio" name="priceRange" value="100,200" /> $100 - $200
				</label>
			</div>
			<div class="field">
				<label>
					<input type="radio" name="priceRange" value="200+" /> $200 &amp; above
				</label>
			</div>
			<div class="field">
				<label>
					<input type="number" name="priceRangeMin" value="" placeholder="Min" />
				</label>
			</div>
			<div class="field">
				<label>
					<input type="number" name="priceRangeMax" value="" placeholder="Max" />
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Graphics Ram</legend>
			<div class="field">
				<label>
					<input type="checkbox" name="graphicsRam" value="GDDR3" /> GDDR3
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="graphicsRam" value="GDDR5" /> GDDR5
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="graphicsRam" value="GDDR6" /> GDDR6
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="graphicsRam" value="GDDR6X" /> GDDR6X
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Manufacturer</legend>
			<div class="field">
				<label>
					<input type="checkbox" name="mfgr" value="AMD" /> AMD
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="mfgr" value="Nvidia" /> Nvidia
				</label>
			</div>
		</fieldset>
		<fieldset>
			<legend>Video Output Interface</legend>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="DisplayPort" /> DisplayPort
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="DVI" /> DVI
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="HDMI" /> HDMI
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="Mini DisplayPort" /> Mini DisplayPort
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="PCI Express" /> PCI Express
				</label>
			</div>
			<div class="field">
				<label>
					<input type="checkbox" name="interface" value="VGA" /> VGA
				</label>
			</div>
		</fieldset>
	</form>
</nav>

<style>
	label,
	legend {
		white-space: nowrap;
	}
</style>
