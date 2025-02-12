import { config } from 'dotenv-flow';
import { keywords, fisherYatesShuffle } from './tools.js';
import slugify from 'slugify';
import { writeFile } from 'fs/promises';
import minimist from 'minimist';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import sharp from 'sharp';

const streamPipeline = promisify(pipeline);
const argv = minimist(process.argv.slice(2), {
	default: { total: 10 }
});
console.log(argv);

config();

const { env } = process;
const strip = /[*+~.(),'"!:@]/g;

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
			model: 'gpt-4o-mini',
			messages: [{ role: 'system', content: prompt }],
			max_tokens: 128000 - Number(tokenSize)
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
	const prompt = [
		'Use the following tone:',
		'=========',
		tone,
		'============',
		'Write a detailed 2000 word blog post about the topic below as an expert in the subject matter.',
		'Return it as a valid JSON object with the following properties:',
		'- content: raw markdown (do not include article title or "# Introduction" at top or "# Conclusion" at bottom)',
		'- title: a unique title for the article',
		'- summary: a brief abstract of the article',
		'- tags: an array of tags related to the following TOC:',
		'=================',
		'Table of Contents:',
		toc
	].join('\n\n');

	const tokenSize = await calculateTokenSize(prompt);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-4o-mini',
			messages: [{ role: 'system', content: prompt }],
			response_format: { type: 'json_object' },
			max_tokens: 128000 - Number(tokenSize)
		})
	});

	const data = await response.json();

	if (!data.choices?.[0]?.message?.content) {
		console.error('No content in response:', data);
		return null;
	}

	try {
		return JSON.parse(data.choices[0].message.content);
	} catch (err) {
		console.error('Failed to parse response:', err);
		console.error('Response content:', data.choices[0].message.content);
		return null;
	}
}

async function downloadImage(url, path) {
	const res = await fetch(url);
	return streamPipeline(res.body, createWriteStream(`.${path}`));
}

async function resizeImage(inputPath, outputPath, newWidth = 256) {
	try {
		await sharp(`.${inputPath}`).resize(newWidth).toFile(`.${outputPath}`);
		console.log('Image resized successfully.');
	} catch (error) {
		console.error('Error resizing image:', error);
	}
}

async function calculateTokenSize(text) {
	const response = await fetch('https://api.openai.com/v1/models/gpt-4o-mini/tokenize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({ input: text })
	});

	const data = await response.json();
	return data.token_count;
}

async function writeBlogPostToFile(blogPost) {
	const { title, content, tags, image, summary, thumbnail } = blogPost;
	const slug = slugify(title.toLowerCase(), { remove: strip });
	const filePath = `./static/_posts/${slug}.js`;
	await writeFile(
		filePath,
		`export const article = {
        title: \`${title}\`,
		image: \`${image.replace('/static', '')}\`,
		thumbnail: \`${thumbnail.replace('/static', '')}\`,
		slug: "${slugify(title.toLowerCase(), { remove: strip })}",
		summary: \`${summary}\`,
        content: \`${content}\`,
        createdAt: "${new Date().toISOString()}",
        author: 'chovy',
		tags: [${[...new Set(tags)]
			.map((tag) => `'${slugify(tag.toLowerCase(), { remove: strip })}'`)
			.join(', ')}],
    };`
	);
}

let errorsFound = 0;
let runs = 1;

const tone = `Act as an expert in the topic. Begin with a clear and objective overview of the topic. Avoid colloquial language or personal anecdotes.
Include quotes or insights from industry experts to add credibility (do not fake any sources).
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
			`You will act as an expert in ${keyword} and generate a Table of Contents for a blog post about ${keyword} using the following tone: ${tone}`
		);
		const blogPost = await generateBlogPost(toc);
		const bannerImage = await generateBannerImage(
			`An tech-inspired photo-realistic or cartoonish image representing ${keyword}. Please do not put any words in the image.`
		);
		console.log(blogPost);
		// process.exit(1);
		console.log(bannerImage);

		if (!blogPost || !blogPost.title || !blogPost.content) {
			console.log('Invalid blog post generated, retrying...');
			return run();
		}

		const imagePath = `/static/_posts/${slugify(blogPost.title.toLowerCase(), {
			remove: strip
		})}-001.png`;
		const thumbPath = `/static/_posts/${slugify(blogPost.title.toLowerCase(), {
			remove: strip
		})}-thumb-001.png`;
		blogPost.image = imagePath;
		blogPost.thumbnail = thumbPath;

		await downloadImage(bannerImage, imagePath);
		await resizeImage(imagePath, thumbPath, 256);
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