<script>
    export let user;
    let saving = false;
    let message = '';
    let preferences = user?.settings?.notificationPreferences || {
        emailNotifications: true,
        emailDigestFrequency: 'instant',
        smsNotifications: false,
        productUpdatesEmail: true // Added new preference
    };

    async function saveSettings() {
        saving = true;
        message = '';
        
        try {
            const response = await fetch('/dashboard/settings/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                message = 'Settings saved successfully!';
                // Update the local user object to reflect the changes
                if (user.settings) {
                    user.settings.notificationPreferences = { ...preferences };
                } else {
                    user.settings = { notificationPreferences: { ...preferences } };
                }
            } else {
                message = 'Failed to save settings. Please try again.';
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            message = 'An error occurred. Please try again.';
        } finally {
            saving = false;
        }
    }
</script>

<div class="settings-section">
    <h2>Notification Settings</h2>
    
    <div class="setting-group">
        <label class="switch">
            <input
                type="checkbox"
                bind:checked={preferences.emailNotifications}
                on:change={saveSettings}
            >
            <span class="slider"></span>
        </label>
        <span>Receive email notifications</span>
    </div>

    <div class="setting-group">
        <label class="switch">
            <input
                type="checkbox"
                bind:checked={preferences.productUpdatesEmail}
                on:change={saveSettings}
            >
            <span class="slider"></span>
        </label>
        <span>Receive product updates and announcements</span>
    </div>

    <div class="setting-group">
        <label class="switch">
            <input
                type="checkbox"
                bind:checked={preferences.smsNotifications}
                on:change={saveSettings}
            >
            <span class="slider"></span>
        </label>
        <span>Receive SMS notifications</span>
    </div>

    {#if preferences.emailNotifications}
        <div class="setting-group">
            <label for="digest-frequency">Email Frequency:</label>
            <select
                id="digest-frequency"
                bind:value={preferences.emailDigestFrequency}
                on:change={saveSettings}
            >
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
                <option value="never">Never</option>
            </select>
        </div>
    {/if}

    {#if message}
        <div class="message {message.includes('success') ? 'success' : 'error'}">
            {message}
        </div>
    {/if}
</div>

<style>
    .settings-section {
        padding: 1rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .setting-group {
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #2196F3;
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ddd;
    }

    .message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
    }

    .success {
        background-color: #d4edda;
        color: #155724;
    }

    .error {
        background-color: #f8d7da;
        color: #721c24;
    }
</style>
