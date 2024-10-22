<script>
    import Spinner from '../../Spinner.svelte';
    export let users = [];

    console.log(users, '<< users');

    let msg = '';
    let isLoading = {};

    let selectedIds = [];
    let lastCheckedIndex = null;
    let bulkAction = '';

    function exportAsCSV() {
        const headers = [
            '#',
            'First Name',
            'Last Name',
            'Email Address',
            'Phone Number',
            'Host',
            'Created At'
        ];
        const rows = users.map((user, index) => [
            index + 1,
            user.firstName,
            user.lastName,
            user.email,
            user.phonePrefix + user.phone,
            (user.headers && user.headers.host) || '',
            user.createdAt
        ]);

        console.log(rows, '<< rows');
        const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function deleteUser(user, index) {
        isLoading[user.id] = true;
        const url = `/admin/db/users/${user.id}/delete`;
        try {
            const res = await fetch(url, {
                method: 'POST'
            });

            const data = await res.json();
            msg = data.message;

            // Remove user from the users array
            users = users.filter(u => u.id !== user.id);

            // Remove user id from selectedIds if present
            selectedIds = selectedIds.filter(id => id !== user.id);

            // No need to remove the DOM element manually
            // Svelte will update the UI
        } catch (err) {
            console.error(err);
        } finally {
            isLoading[user.id] = false;
        }
    }

    function handleCheckboxClick(event, index) {
        const id = users[index].id;
        const checked = event.target.checked;
        if (event.shiftKey && lastCheckedIndex !== null) {
            const start = Math.min(index, lastCheckedIndex);
            const end = Math.max(index, lastCheckedIndex);
            for (let i = start; i <= end; i++) {
                const uid = users[i].id;
                if (checked && !selectedIds.includes(uid)) {
                    selectedIds = [...selectedIds, uid];
                } else if (!checked && selectedIds.includes(uid)) {
                    selectedIds = selectedIds.filter(id => id !== uid);
                }
            }
        } else {
            if (checked) {
                if (!selectedIds.includes(id)) {
                    selectedIds = [...selectedIds, id];
                }
            } else {
                selectedIds = selectedIds.filter(sid => sid !== id);
            }
        }
        lastCheckedIndex = index;
    }

    function toggleSelectAll(event) {
        const checked = event.target.checked;
        if (checked) {
            selectedIds = users.map(user => user.id);
        } else {
            selectedIds = [];
        }
    }

    async function performBulkAction() {
        if (bulkAction === 'delete') {
            try {
                const res = await fetch('/api/admin/db/users/mass/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedIds })
                });
                const data = await res.json();
                msg = data.message;

                // Remove deleted users from the users array
                users = users.filter(user => !selectedIds.includes(user.id));
                selectedIds = [];
                bulkAction = '';
            } catch (err) {
                console.error(err);
            }
        }
    }
</script>

<div>
    <h2>Users</h2>
    <button on:click={exportAsCSV}>Export as CSV</button>
    
    <div>
        <select bind:value={bulkAction}>
            <option value="">Bulk Actions</option>
            <option value="delete">Delete Selected</option>
        </select>
        <button on:click={performBulkAction} disabled={selectedIds.length === 0 || !bulkAction}>Apply</button>
    </div>

    {#if msg}<pre>{JSON.stringify(msg, null, 2)}</pre>{/if}
    <table>
        <thead>
            <tr>
                <th><input type="checkbox" on:change={toggleSelectAll} /></th>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>Real IP</th>
                <th>Forwarded IP</th>
                <th>Created At</th>
                <th>Verified Email</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each users as user, index}
                <tr id="user-{index}">
                    <td>
                        <input type="checkbox"
                            checked={selectedIds.includes(user.id)}
                            on:click={(event) => handleCheckboxClick(event, index)}
                        />
                    </td>
                    <td>{index + 1}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phonePrefix + user.phone}</td>
                    <td>{(user.headers && user.headers['x-real-ip']) || ''}</td>
                    <td>{(user.headers && user.headers['x-forwarded-for']) || ''}</td>
                    <td>{user.createdAt}</td>
                    <td>{user.verify?.email.status || 'n/a'}</td>
                    <td>
                        <a href="#delete"
                            on:click|preventDefault={() => {
                                deleteUser(user, index);
                            }}
                        >
                            delete
                            {#if Boolean(isLoading[user.id])}
                                <span class="spinner">
                                    <Spinner isLoading={Boolean(isLoading[user.id])} color="black" />
                                </span>
                            {/if}
                        </a>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    table {
        width: 100%;
        text-align: center;
    }
    tbody tr:hover {
        background-color: var(--tbody-tr-hover-background-color);
    }

    a[href='#delete'] {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    a[href='#delete'] span {
        margin-right: 0.8rem;
    }

    /* span.spinner {
        margin-left: 0.8rem;
    } */
</style>
