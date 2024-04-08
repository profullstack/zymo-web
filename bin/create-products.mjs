import { Command } from 'commander';
import fs from 'fs';
import Stripe from 'stripe'
import { Surreal } from 'surrealdb.js';
import env from 'rcompat/env';

const {
    STRIPE_SK,
    DB_USER: username,
    DB_PASS: password,
    DB_HOST: host,
    DB_NS: namespace,
    DB_DB: database,
    DB_PORT: port,
} = env;

const stripe = new Stripe(STRIPE_SK);

const db = new Surreal();

db.connect(host + ":" + port + "/rpc",
    {
        namespace,
        database,

        auth: {
            namespace,
            database,
            username,
            password
        }
    })


const program = new Command();

program
    .option('-D, --delete-all', 'Delete all products')
    .option('-d, --delete <productid>', 'Delete a product by ID')
    .option('-c, --create-products', 'Create and Update products from products.json file')
    .option('-l, --list-products', 'List all products')
    .parse(process.argv);

if (program.delete) {
    const productId = program.delete;
    deleteProduct(productId);

} else if (program.createProducts) {

    createProducts('./bin/products.json');

} else if (program.deleteAll) {
    deleteAllProducts();

} else if (program.listProducts) {

    (async () => {
        var products = await getDBProducts()

        products = products.map( product => {
            return { id: product.stripeProductId, price: product.price, name: product.name, mode: product.mode }
        })

        console.log(JSON.stringify(products, null, 2))
    })()
} else {

    console.log("Invalid command, use --help to show available commands")

}


async function createProducts(jsonFile) {
    const products = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

    const newProducts = await Promise.all(
        products.map(async (product) => {

            const dbProducts = await getDBProducts()

            const index = dbProducts.findIndex((p) => p.stripeProductId == product.id);

            var subscriptionPriceIds;
            var stripePriceId;

            if (index == -1) {
                const stripeProduct = await stripe.products.create({
                    name: product.name,
                });

                product.id = stripeProduct.id;

                if (product.mode == "subscription") {
                    subscriptionPriceIds = await createSubscriptionPriceIds(product.id, product.price)
                } else {
                    const price = await stripe.prices.create({
                        unit_amount: product.price * 100,
                        currency: "usd",
                        product: stripeProduct.id,
                    });

                    stripePriceId = price.id
                }

                const now = new Date().toISOString()

                await db.create("products", { ...product, subscriptionPriceIds, stripePriceId, stripeProductId: product.id, updatedAt: now, createdAt: now });
                

            } else {

                const dbProduct = dbProducts[index];

                if (dbProduct.price != product.price) {

                    if (product.mode == "subscription") {

                        subscriptionPriceIds = await createSubscriptionPriceIds(product.id, product.price)

                    } else {

                        const price = await stripe.prices.create({
                            unit_amount: product.price * 100,
                            currency: "usd",
                            product: stripeProduct.id,
                        });

                        stripePriceId = price.id
                    }

                    await db.merge(product.id, {
                        subscriptionPriceIds,
                        stripePriceId,
                        price: product.price,
                        updatedAt: new Date().toISOString()
                    });

                }
            }

            return product;
        }));

    console.log(JSON.stringify(newProducts, null, 2))
}

async function deleteProduct(id) {
    try {
        
        const query = `DELETE FROM products WHERE stripeProductId = $id`;
        const products = await db.query(query, {
            id
        });
        console.log(id, "deleted successfully")
    } catch (e) { }

}

async function deleteAllProducts() {
    try {
        const query = `DELETE FROM products;`;
        const products = await db.query(query);
        console.log("All products deleted successfully");
    } catch (e) { }
}

async function createSubscriptionPriceIds(productId, price) {

    const billingFrequencies = ['day', 'week', 'month', 'year']

    let subscriptionPriceIds = await Promise.all(
        billingFrequencies.map(async (billingFrequency) => {

            try {
                const stripePrice = await stripe.prices.create({
                    unit_amount: price * 100,
                    currency: "usd",
                    product: productId,
                    recurring: { interval: billingFrequency }
                });
                return {
                    type: billingFrequency,
                    id: stripePrice.id
                }
            } catch (e) {
                console.log(e)
            }
        }))

    return subscriptionPriceIds;
}

async function getDBProducts() {
    return await db.select('products');
}

