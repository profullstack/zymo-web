import { Command } from 'commander';
import fs from 'fs';
import { Surreal } from 'surrealdb.js';
import env from '@rcompat/env';
import { config } from 'dotenv-flow';
import fetch from 'node-fetch'; // Use fetch for API calls

config();

const {
	LEMONSQUEEZY_API_KEY,
	DB_USER: username,
	DB_PASS: password,
	DB_HOST: host,
	DB_NS: namespace,
	DB_DB: database,
	DB_PORT: port
} = env;

const db = new Surreal();

async function connectDB() {
	await db.connect(host + ':' + port + '/rpc', {
		namespace,
		database,
		auth: {
			username,
			password
		}
	});
}

async function lemonsqueezyFetch(endpoint, method = 'POST', body = null) {
	const response = await fetch(`https://api.lemonsqueezy.com/v1/${endpoint}`, {
		method,
		headers: {
			Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: body ? JSON.stringify(body) : null
	});

	if (!response.ok) {
		throw new Error(`Lemonsqueezy API error: ${response.statusText}`);
	}

	return response.json();
}

const program = new Command();

program
	.option('-D, --delete-all', 'Delete all products')
	.option('-d, --delete <productid>', 'Delete a product by ID')
	.option('-c, --create-products', 'Create and Update products from products.json file')
	.option('-l, --list-products', 'List all products')
	.option('-s, --save-products', 'Save list of products to ./bin/products.json')
	.option('-r, --remove-table <tableName>', 'Remove the products or payments table')
	.parse(process.argv);

const options = program.opts();

(async () => {
	try {
		await connectDB();

		if (options.delete) {
			const productId = options.delete;
			await deleteProduct(productId);
		} else if (options.createProducts) {
			await createProducts('./bin/products.json');
		} else if (options.deleteAll) {
			await deleteAllProducts();
		} else if (options.listProducts) {
			const products = await getDBProducts();
			const formattedProducts = products.map((product) => ({
				id: product.lemonsqueezyProductId,
				price: product.price,
				name: product.name,
				mode: product.mode,
				subscriptionOptions: product.subscriptionOptions
			}));
			console.log(JSON.stringify(formattedProducts, null, 2));
		} else if (options.saveProducts) {
			await saveProducts();
		} else if (options.removeTable) {
			await removeTable(options.removeTable);
		} else {
			console.log('Invalid command, use --help to show available commands');
		}
	} catch (error) {
		console.error('Error:', error);
	} finally {
		await db.close();
		process.exit();
	}
})();

async function createProducts(jsonFile) {
	const products = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

	const newProducts = [];

	for (const product of products) {
		const dbProducts = await getDBProducts();
		const index = dbProducts.findIndex((p) => p.lemonsqueezyProductId === product.id);

		let subscriptionOptions;
		let lemonsqueezyVariantId;

		if (index === -1) {
			// Create Lemonsqueezy Product
			const lemonsqueezyProduct = await lemonsqueezyFetch('products', 'POST', {
				data: {
					type: 'products',
					attributes: {
						name: product.name,
						description: product.description || '',
						status: 'published' // Or 'draft'
					}
				}
			});

			product.id = lemonsqueezyProduct.data.id;

			if (product.mode === 'subscription') {
				subscriptionOptions = await createSubscriptionOptions(
					product.id,
					product.price,
					product.subscriptionOptions
				);
			} else {
				// Create Lemonsqueezy Variant (Price)
				const variant = await lemonsqueezyFetch('variants', 'POST', {
					data: {
						type: 'variants',
						attributes: {
							product_id: product.id,
							price: product.price * 100, // Price in cents
							currency: 'USD'
						}
					}
				});

				lemonsqueezyVariantId = variant.data.id;
			}

			const now = new Date().toISOString();
			product.subscriptionOptions = subscriptionOptions;

			await db.create('products', {
				...product,
				lemonsqueezyVariantId,
				lemonsqueezyProductId: product.id,
				updatedAt: now,
				createdAt: now
			});
		} else {
			const dbProduct = dbProducts[index];

			if (
				dbProduct.price !== product.price ||
				dbProduct.subscriptionOptions !== product.subscriptionOptions
			) {
				if (product.mode === 'subscription') {
					subscriptionOptions = await createSubscriptionOptions(
						product.id,
						product.price,
						product.subscriptionOptions
					);
				} else {
					// Update price with Lemonsqueezy
					const variant = await lemonsqueezyFetch('variants', 'POST', {
						data: {
							type: 'variants',
							attributes: {
								product_id: dbProduct.lemonsqueezyProductId,
								price: product.price * 100, // Price in cents
								currency: 'USD'
							}
						}
					});

					lemonsqueezyVariantId = variant.data.id;
				}

				await db.merge(dbProduct.id, {
					subscriptionOptions,
					lemonsqueezyVariantId,
					price: product.price,
					updatedAt: new Date().toISOString()
				});

				product.subscriptionOptions = subscriptionOptions;
			}
		}

		newProducts.push(product);
	}

	console.log(JSON.stringify(newProducts, null, 2));
}
