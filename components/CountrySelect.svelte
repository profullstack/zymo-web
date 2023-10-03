<script>
    export let status, errors, countries;

    let selected = countries.find(item => item.code === 'us');

    function selectItem(e, item) {
        e.preventDefault();

        const el = e.currentTarget;
        el.classList.remove('open');
        selected = item;   
    }

    function closeDropDown(e) {
        const el = e.currentTarget.querySelector('ul') || e.currentTarget;
        el.classList.remove('open');
    }

    function toggleDropDown(e) {
        e.preventDefault();

        const el = e.currentTarget.querySelector('ul') || e.currentTarget;
        el.classList.contains('open') ? el.classList.remove('open') : el.classList.add('open');
    }
</script>


<div class="dropdown" on:click={toggleDropDown}>
    <div class="selected">
      <label>
        <span class="fi fi-{selected.code}"></span>
        {selected.code.toUpperCase()}
        <input type="text" name="telephonePrefix" value={selected.telephonePrefix || ''} style="width: {selected.telephonePrefix ? selected.telephonePrefix.length + 2 : 3}rem;"/>
      </label>

    </div>
    <ul on:mouseleave={closeDropDown}>
      {#each countries as country}
        <li on:click={(e) => selectItem(e, country)}>
          <span class="fi fi-{country.code}"></span>
          {country.name}
          {country.code.toUpperCase()}
          {country.telephonePrefix || ''}
        </li>
      {/each}
    </ul>
  </div>.
<style>

    .dropdown {
      position: relative;
    }
  
    .dropdown .selected {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: nowrap;
      width: max-content;
      margin-right: 1rem;
    }
    .dropdown ul {
      width: max-content;
      overflow-y: auto;
      position: absolute;
      top: 100%;
      left: 0;
      background-color: #fff; /* Add your preferred background color */
      border: 1px solid #ccc; /* Add your preferred border styles */
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add shadow if needed */
      list-style-type: none;
      padding: .4rem .8rem;
      cursor: pointer;
      display: none;
      margin: 0;
  }
  
    .dropdown .open {
      display: block;
      height: 30rem;
    }
    .dropdown li {
      margin-bottom: .5rem;
    }
  </style>