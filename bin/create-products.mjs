import { Command } from 'commander';
import fs from 'fs';
import Stripe from 'stripe';
import { Surreal } from 'surrealdb.js';
import env from '@rcompat/env';
import { config } from 'dotenv-flow';

config();

const {
    STRIPE_SK,
    DB_USER: username,
    DB_PASS: password,
    DB_HOST: host,
    DB_NS: namespace,
    DB_DB: database,
    DB_PORT: port
} = env;

const stripe = new Stripe(STRIPE_SK);
const db = new Surreal();

async function connectDB() {
    await db.connect(host + ':' + port + '/rpc', {
        namespace,
        database,
        auth: {
            namespace,
            database,
            username,
            password
        }
    });
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
                id: product.stripeProductId,
                price: product.price,
                name: product.name,
                mode: product.mode,
                subscriptionOptions: product.subscriptionOptions,
            }));
            console.log(JSON.stringify(formattedProducts, null, 2));
        }
        else if (options.saveProducts) {
            await saveProducts();
        }
        else if (options.removeTable) {
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
        const index = dbProducts.findIndex((p) => p.stripeProductId === product.id);

        let subscriptionOptions;
        let stripePriceId;

        if (index === -1) {
            const stripeProduct = await stripe.products.create({
                name: product.name
            });

            product.id = stripeProduct.id;

            if (product.mode === 'subscription') {
                subscriptionOptions = await createSubscriptionOptions(
                    product.id,
                    product.price,
                    product.subscriptionOptions
                );
            } else {
                const price = await stripe.prices.create({
                    unit_amount: product.price * 100,
                    currency: 'usd',
                    product: stripeProduct.id
                });

                stripePriceId = price.id;
            }

            const now = new Date().toISOString();
            product.subscriptionOptions = subscriptionOptions;

            await db.create('products', {
                ...product,
                stripePriceId,
                stripeProductId: product.id,
                updatedAt: now,
                createdAt: now
            });
        } else {
            const dbProduct = dbProducts[index];

            if (dbProduct.price !== product.price || dbProduct.subscriptionOptions !== product.subscriptionOptions) {
                if (product.mode === 'subscription') {
                    subscriptionOptions = await createSubscriptionOptions(
                        product.id,
                        product.price,
                        product.subscriptionOptions
                    );
                } else {
                    const price = await stripe.prices.create({
                        unit_amount: product.price * 100,
                        currency: 'usd',
                        product: dbProduct.stripeProductId
                    });

                    stripePriceId = price.id;
                }

                await db.merge(dbProduct.id, {
                    subscriptionOptions,
                    stripePriceId,
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


async function deleteProduct(id) {
    try {
        const query = `DELETE FROM products WHERE stripeProductId = $id`;
        await db.query(query, { id });
        console.log(id, 'deleted successfully');
    } catch (e) {
        console.error('Error deleting product:', e);
    }
}

async function deleteAllProducts() {
    try {
        const query = `DELETE FROM products;`;
        await db.query(query);
        console.log('All products deleted successfully');
    } catch (e) {
        console.error('Error deleting all products:', e);
    }
}

async function createSubscriptionOptions(productId, productPrice, options) {
    const optionsMap = [
        {
            type: 'day',
            getPrice: (price) => price / 30
        },
        {
            type: 'week',
            getPrice: (price) => price / 4
        },
        {
            type: 'month',
            getPrice: (price) => price
        },
        {
            type: 'year',
            getPrice: (price) => price * 12
        }
    ];

    const subscriptionOptions = await Promise.all(
        options.map(async (option) => {
            try {
                const optionDetails = optionsMap.find((o) => o.type === option.type);
                const price = option.price ? option.price : optionDetails.getPrice(productPrice);

                const stripePrice = await stripe.prices.create({
                    unit_amount: price * 100,
                    currency: 'usd',
                    product: productId,
                    recurring: { interval: optionDetails.type }
                });

                return {
                    type: optionDetails.type,
                    id: stripePrice.id,
                    price
                };
            } catch (e) {
                console.error('Error creating subscription option:', e);
            }
        })
    );

    return subscriptionOptions.filter((option) => option); // Filter out any undefined values
}


async function saveProducts() {
    const products = await getDBProducts();

    const formattedProducts = products.map((product) => {
        return {
            id: product.stripeProductId,
            price: product.price,
            name: product.name,
            mode: product.mode,
            subscriptionOptions: product.subscriptionOptions
        };
    });

    fs.writeFileSync('./bin/products.json', JSON.stringify(formattedProducts, null, 2));
    console.log('Products saved to ./bin/products.json');
}

async function removeTable(tableName) {

    if(tableName !== "products" && tableName !== "payments") {
        console.log(`Invalid table name "${tableName}"`)
        return;
    }

    const query = `REMOVE TABLE ${tableName}`;
    const table = await db.query(query);
    console.log(`Table "${tableName}" removed successfully`);
}

async function getDBProducts() {
    const query = 'SELECT * FROM products ORDER BY createdAt ASC';
    const products = await db.query(query);
    return products.pop();
}
