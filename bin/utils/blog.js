import { config } from 'dotenv-flow';
import { keywords, fisherYatesShuffle } from './tools.js';
import slugify from 'slugify';
import { writeFile } from 'fs/promises';
import minimist from 'minimist';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);
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

async function generateBannerImage(prompt) {
	const response = await fetch('https://api.openai.com/v1/images/generations', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'dall-e-3',
			prompt,
			size: '1024x1024',
			n: 1
		})
	});

	const data = await response.json();
	return data.data[0].url;
}
async function generateBlogPost(toc) {
	console.log('toc:', toc);
	const prompt = `Use the following tone:\n\n=========\n\n${tone}\n\n============\n\n
	...and write a detailed 2000 word blog post about the topic above and return it to me as raw JSON with 'content' property as raw markdown (do not include article title or "# Introduction" at top of markdown) and 'title' property with a unique title, a 'summary' property with a brief abstract of the article, a 'tags' property with tags related to the following TOC:
	\n\n=================\n\nTable of Contents:\n\n${toc}`;

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

	if (data.choices[0].message.content) {
		try {
			return JSON.parse(data.choices[0].message.content);
		} catch (err) {
			console.error(err);
		}
	}
}

async function downloadImage(url, path) {
	const res = await fetch(url);
	return streamPipeline(res.body, createWriteStream(`.${path}`));
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

async function writeBlogPostToFile(blogPost) {
	const { title, content, tags, image, summary } = blogPost;
	const slug = slugify(title.toLowerCase());
	const filePath = `./static/_posts/${slug}.js`;
	await writeFile(
		filePath,
		`export const article = {
        title: \`${title}\`,
		image: \`${image}\`,
		slug: "${slugify(title.toLowerCase())}",
		summary: \`${summary}\`,
        content: \`${content}\`,
        createdAt: "${new Date().toISOString()}",
        author: 'chovy',
		tags: [${[...new Set(tags)].map((tag) => `'${slugify(tag.toLowerCase())}'`).join(', ')}],
    };`
	);
}

let errorsFound = 0;
let runs = 1;

const tone = `Begin with a clear and objective overview of the topic. Avoid colloquial language or personal anecdotes.
Include quotes or insights from industry experts to add credibility.
Use industry-specific terminology accurately to establish authority and expertise.
Use descriptive subheadings to guide the reader through the article.
Present relevant case studies or examples in a formal and detailed manner.
Clearly outline the implications of the information presented and offer a concise conclusion.
End with a call to action that encourages professional dialogue or further research.`;

async function run() {
	console.log('runs:', runs, ' of ', argv.total);
	console.log('errors:', errorsFound);

	try {
		const keyword = fisherYatesShuffle(keywords).pop();
		const toc = await generateTableOfContents(
			`Generate a Table of Contents for a blog post about ${keyword} using the following tone: ${tone}`
		);
		const blogPost = await generateBlogPost(toc);
		const bannerImage = await generateBannerImage(
			`An tech-inspired photo-realistic or cartoonish image representing ${keyword}. Please do not put any words in the image.`
		);
		console.log(blogPost);
		// process.exit(1);
		console.log(bannerImage);

		if (!blogPost.title || !blogPost.content) {
			return run();
		}

		const imagePath = `/static/_posts/${slugify(blogPost.title.toLowerCase())}-001.png`;
		blogPost.image = imagePath;

		await downloadImage(bannerImage, imagePath);
		await writeBlogPostToFile(blogPost);
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