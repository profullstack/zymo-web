#!/usr/bin/env bun

const fetch = globalThis.fetch;

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: podsearch "podcast name"');
    process.exit(1);
  }
  const podcastName = args.join(' ');

  const url = 'https://castos.com/wp-admin/admin-ajax.php';

  const formData = new FormData();
  formData.append('search', podcastName);
  formData.append('action', 'feed_url_lookup_search');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': '*/*',
      'User-Agent': 'podsearch-cli/1.0',
      'Referer': 'https://castos.com/tools/find-podcast-rss-feed/',
      'Origin': 'https://castos.com',
    },
  });

  if (!response.ok) {
    console.error('Error:', response.statusText);
    process.exit(1);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

