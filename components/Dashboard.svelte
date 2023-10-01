<script>
	export let links;
    export let apikeys;

    let status = {};

    async function deleteLink(e, link) {
        e.preventDefault();
        try {
            const res = await fetch(`/links/${link.id}`, {
                method: 'DELETE',
            });

            const result = await res.json();
            status[link.id] = result;
            e.target.closest('li').remove();
        } catch(err) {
            status[link.id] = err;
        }
    }

    async function deleteApiKey(e, apikey) {
        e.preventDefault();
        try {
            const res = await fetch(`/apikeys/${apikey.id}`, {
                method: 'DELETE',
            });

            const result = await res.json();
            status[apikey.id] = result;
            e.target.closest('li').remove();
        } catch(err) {
            status[apikey.id] = err;
        }
    }

    
    function gatherBrowserInfo() {
        return {
            navigator: {
                userAgent: navigator.userAgent,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                language: navigator.language,
                languages: navigator.languages,
                hardwareConcurrency: navigator.hardwareConcurrency,
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                colorDepth: window.screen.colorDepth
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            document: {
                referrer: document.referrer,
                domain: document.domain,
                URL: document.URL,
                title: document.title,
                lastModified: document.lastModified
            },
            location: {
                href: location.href,
                protocol: location.protocol,
                host: location.host,
                hostname: location.hostname,
                port: location.port,
                pathname: location.pathname,
                search: location.search
            },
            // Attempting to get network information, but this might not be available in many browsers.
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                rtt: navigator.connection.rtt,
                downlink: navigator.connection.downlink
            } : null
        };
    }

    async function track(e, link) {
        e.preventDefault();

        try {
            const data = gatherBrowserInfo();
            const response = await fetch(`/track/${link.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(result);
        } catch(err) {
            console.error(err);
        } finally {
            window.location.href = e.target.href;
        }
    }
</script>

<h2>Links</h2>

<ol>
{#each links as link}
    <li>
        <a href="{link.url}" target="_new">{link.url}</a>
         <nav>
            <a href="/links/{link.id}">edit</a>
            {#if link.alias}<a href="/a/{link.alias}" on:click={(e) => track(e, link)}>{link.alias}</a>{/if}
            <a href="/l/{link.id}"  on:click={(e) => track(e, link)}>{link.id}</a>
            <a href="#" on:click={(e) => {
                deleteLink(e, link)
            }}>delete</a>
            {#if status[link.id]?.status}{status[link.id].status}{/if}
        </nav>
    </li>
{/each}
</ol>

<h2>API keys</h2>

<ol>
{#each apikeys as apikey}
    <li>
        {apikey.name}
         <nav>
            <a href="/apikeys/{apikey.id}">edit</a>
            <a href="#" on:click={(e) => {
                deleteApiKey(e, apikey)
            }}>delete</a>
            {#if status[apikey.id]?.status}{status[apikey.id].status}{/if}
        </nav>
    </li>
{/each}
</ol>
<style>
    li {
        margin-bottom: 1.2rem;
    }
</style>
