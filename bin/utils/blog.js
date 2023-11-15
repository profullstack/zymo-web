import { config } from 'dotenv-flow';
import { keywords, fisherYatesShuffle } from './tools.js';
config();

const { env } = process;

async function generateTableOfContents(prompt) {
	console.log(prompt);
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'system', content: prompt }],
			max_tokens: 3000
		})
	});

	const data = await response.json();
	console.log(data.choices[0].message);
	return data.choices[0].message.content;
}

async function generateBlogPost(toc) {
	console.log('toc:', toc);
	const prompt = `Write a detailed 2000 word blog post about the following topics and return it to me as raw markdown related to the topic:\n\n=================\n\n${toc}`;
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${env.OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'system', content: prompt }],
			max_tokens: 3000
		})it 
	});

	const data = await response.json();
	return data.choices[0].message.content;
}

const keyword = fisherYatesShuffle(keywords).pop();
const toc = await generateTableOfContents(`Table of Contents for a blog post about ${keyword}`);
const blogPost = await generateBlogPost(toc);
console.log(blogPost);
