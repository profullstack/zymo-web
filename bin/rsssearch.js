#!/usr/bin/env bun

const fetch = globalThis.fetch;

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: rsssearch "marketing"');
    process.exit(1);
  }
  const keyword = args.join(' ');
	const url = 'https://rssfinder.app/gql';

	const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0',
  'Content-Type': 'application/json',
}; 
	const body = JSON.stringify({
		operationName: 'searchInFinder',
		variables: {
			text: keyword,
		},
		query: `query searchInFinder($text: String!) {
		searchInFinder(text: $text) {
			textResult {
				feeds {
					title
					description
					icon
					url
					articles {
						id
						title
						__typename
					}
					__typename
				}
				related
				__typename
			}
			urlResult {
				feeds {
					title
					description
					icon
					url
					articles {
						id
						title
						__typename
					}
					__typename
				}
				related
				__typename
			}
			__typename
		}
	}`,
	});

	const options = {
		method: 'POST',
		headers: headers,
		body: body,
	};

	try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error('Error:', response.statusText);
    process.exit(1);
  }
	} catch(err) {
		console.error(err);
	}
}
main().catch(err => { console.error('Error:', err); process.exit(1); });
