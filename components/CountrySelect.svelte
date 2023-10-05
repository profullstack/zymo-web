<script>
    export let status, errors, countries;

    let selected = countries?.find(item => item.code === 'us');
    let filter = '';
    let filteredCountries = countries;


    function selectItem(e, item) {
        e.preventDefault();

        const el = e.currentTarget.parentNode;
        console.log(el);
        el.classList.remove('open');
        selected = item;   
    }

    function filterValues(e) {
        filteredCountries = countries.filter(item => {
            return item.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
             item.code?.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
             item.iso3?.toLowerCase().indexOf(filter.toLowerCase()) > -1;
        });
    }


    function closeDropDown(e) {
        const el = e.currentTarget.querySelector('ul') || e.currentTarget;
        el.classList.remove('open');
    }

    function openDropDown(e) {
        e.preventDefault();
        e.stopPropagation();

        const el = e.currentTarget.parentNode.querySelector('ul') || e.currentTarget;
        el.classList.add('open');
        e.currentTarget.parentNode.querySelector('ul .filter input').focus();
    }
</script>

<div class="dropdown">
  {#if selected}
    <div class="selected" on:click={openDropDown}>
      <label>
        <span class="fi fi-{selected.code}"></span>
        {selected.code.toUpperCase()}
        <input type="text" name="phonePrefix" value={selected.telephonePrefix || ''} style="width: {selected.telephonePrefix ? selected.telephonePrefix.length + 2 : 3}rem;" required />
      </label>
    </div>
  {/if}
  {#if filteredCountries}
    <ul on:mouseleave={closeDropDown}>
        <li>
          <div class="filter">
            <input type="text" bind:value={filter} on:input={filterValues} />
          </div>
        </li>
      {#each filteredCountries as country}
        <li on:click={(e) => selectItem(e, country)}>
          <span class="fi fi-{country.code}"></span>
          {country.name}
          {country.code.toUpperCase()}
          {country.telephonePrefix || ''}
        </li>
      {/each}
    </ul>
    {/if}
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
      padding: 0;
      cursor: pointer;
      display: none;
      margin: 0;
    }

    .dropdown ul > li:first-child {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #fff;
        z-index: 2;
        margin: 0;
        padding: 0 0 .8rem 0;
        border: none; /* Add your preferred background color */
    }   
  
    .dropdown .open {
      display: block;
      height: 30rem;
    }
    .dropdown li {
      margin-bottom: .5rem;
      padding: .4rem .8rem;
    }
  </style>