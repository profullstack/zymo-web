import { config } from 'dotenv-flow';
import { keywords, fisherYatesShuffle } from './tools.js';
import slugify from 'slugify';
import { writeFile } from 'fs/promises';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2), {
	default: { total: 10 }
});
console.log(argv);

config();

const { env } = process;

async function generateTableOfContents(prompt) {
	console.log(prompt);
	const tokenSize = await calculateTokenSize(prompt);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'system', content: prompt }],
			max_tokens: 4000 - Number(tokenSize)
		})
	});

	const data = await response.json();
	// console.log(data.choices[0].message);
	return data.choices[0].message.content;
}

async function generateBlogPost(toc) {
	console.log('toc:', toc);
	const prompt = `Write a detailed 2000 word blog post about the following topics and return it to me as raw JSON with 'content' property as raw markdown (do not include article title or "# Introduction" at top) and 'title' property with a unique title, a 'tags' property with related tags related to the topic:\n\n=================\n\n${toc}`;

	const tokenSize = await calculateTokenSize(prompt);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'system', content: prompt }],
			max_tokens: 4000 - Number(tokenSize)
		})
	});

	const data = await response.json();
	return data.choices[0].message.content;
}

async function calculateTokenSize(text) {
	const response = await fetch('https://api.openai.com/v1/tokens', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({ text: text })
	});

	const data = await response.json();
	return data.tokens;
}

async function writeBlogPostToFile(title, content, tags) {
	const slug = slugify(title.toLowerCase());
	const filePath = `./static/_posts/${slug}.js`;
	await writeFile(
		filePath,
		`export const article = {
        title: \`${title}\`,
		slug: "${slugify(title.toLowerCase())}",
        content: \`${content}\`,
        createdAt: "${new Date().toISOString()}",
        author: 'chovy',
		tags: [${[...new Set(tags)].map((tag) => `'${slugify(tag.toLowerCase())}'`).join(', ')}],
    };`
	);
}

let errorsFound = 0;
let runs = 1;

async function run() {
	console.log('runs:', runs, ' of ', argv.total);
	console.log('errors:', errorsFound);

	try {
		const keyword = fisherYatesShuffle(keywords).pop();
		const toc = await generateTableOfContents(
			`Table of Contents for a blog post about ${keyword}`
		);
		const blogPost = await generateBlogPost(toc);
		console.log(blogPost);
		const { title, content, tags } = JSON.parse(blogPost); // Replace this with actual title extraction logic
		await writeBlogPostToFile(title, content, tags);
	} catch (err) {
		console.error(err);
		errorsFound++;

		if (errorsFound < 10) {
			run();
		}
	} finally {
		runs++;

		if (runs < argv.total) {
			run();
		}
	}
}

run();