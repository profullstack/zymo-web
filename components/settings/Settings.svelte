<script>
    import NotificationSettings from './NotificationSettings.svelte';
    export let user;
</script>

<div class="settings-container">
    <code><pre>{JSON.stringify(user, null, 2)}</pre></code>
    <h1>Settings</h1>
    
    <section class="settings-section">
        <h2>Notifications</h2>
        <NotificationSettings {user} />
    </section>

    <!-- Add more settings sections here as needed -->
</div>

<style>
    .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .settings-section {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
        margin-bottom: 2rem;
        color: var(--primary-color, #333);
    }

    h2 {
        margin-bottom: 1rem;
        font-size: 1.25rem;
        color: var(--secondary-color, #666);
    }
</style>
