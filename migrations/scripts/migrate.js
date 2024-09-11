import Surreal from 'surrealdb.js';
import { config } from 'dotenv-flow';
import fs from 'fs/promises';
import path from 'path';

config();

const {
	DB_USER: username,
	DB_PASS: password,
	DB_HOST: host,
	DB_NS: namespace,
	DB_DB: database,
	DB_PORT: port
} = process.env;

const db = new Surreal();

async function connectDB() {
	await db.connect(`${host}:${port}/rpc`, {
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

// Function to initialize the migration history table
async function initializeMigrationTable() {
	const DATA = `
    DEFINE TABLE migration_history SCHEMAFULL
    PERMISSIONS
      FOR select FULL,
      FOR update, delete, create FULL;
    DEFINE FIELD collection ON migration_history TYPE string;
    DEFINE FIELD version ON migration_history TYPE int;
    DEFINE FIELD createdAt ON migration_history TYPE datetime;
    DEFINE FIELD direction ON migration_history TYPE string;
    DEFINE INDEX idx_collection_version ON migration_history COLUMNS collection, version, direction UNIQUE;
  `;

	console.log(`Executing INIT: ${DATA}`);

	try {
		const result = await db.query(DATA);
		console.log('Migration history table initialized:', result);
	} catch (error) {
		console.error('Failed to initialize migration history table:', error.message);
	}
}

// Function to get the latest migration version and direction for a specific collection
async function getLatestVersionAndDirection(collection) {
	const query = `
    SELECT * FROM migration_history 
    WHERE collection = '${collection}' 
    ORDER BY createdAt DESC, version DESC 
    LIMIT 1
  `;

	try {
		const [[result]] = await db.query(query);

		console.log('RESULT:', result);

		if (!result) {
			console.log('No records found in migration history.');
			return { version: 0, direction: 'none' };
		}

		const latestVersion = result.version || 0;
		const latestDirection = result.direction || 'none';

		console.log(
			`Latest migration record fetched: version ${latestVersion}, direction ${latestDirection}`
		);
		return { version: latestVersion, direction: latestDirection };
	} catch (error) {
		console.error('Failed to fetch the latest migration version and direction:', error.message);
		return { version: 0, direction: 'none' };
	}
}

// Function to apply a migration up for a specific collection
async function migrateUp(collection, version) {
	const timestamp = new Date().toISOString();
	const upFile = path.resolve(`./migrations/scripts/${collection}/${version}.up.query`);

	try {
		const data = await fs.readFile(upFile, 'utf8');
		console.log(
			`Executing UP migration for collection '${collection}' version '${version}': ${data}`
		);

		await db.query(data);

		const insertQuery = `
      INSERT INTO migration_history 
      (collection, version, createdAt, direction) 
      VALUES ('${collection}', ${version}, '${timestamp}', 'up');
    `;
		console.log(`Executing INSERT: ${insertQuery}`);

		await db.query(insertQuery);

		console.log(
			`Migration to version ${version} applied for collection ${collection} in the 'up' direction.`
		);
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log(
				`No further UP migration file found for collection '${collection}' at version ${version}.`
			);
			return false; // Stop further processing for this collection
		} else {
			console.error(
				`Error applying UP migration or inserting history for collection '${collection}': ${error.message}`
			);
		}
	}
	return true; // Continue processing if no error
}

// Function to rollback a migration down for a specific collection
async function migrateDown(collection, version) {
	const timestamp = new Date().toISOString();
	const downFile = path.resolve(`./migrations/scripts/${collection}/${version}.down.query`);

	try {
		const data = await fs.readFile(downFile, 'utf8');
		console.log(
			`Executing DOWN migration for collection '${collection}' version '${version}': ${data}`
		);

		await db.query(data);

		const insertQuery = `
      INSERT INTO migration_history 
      (collection, version, createdAt, direction) 
      VALUES ('${collection}', ${version}, '${timestamp}', 'down');
    `;
		console.log(`Executing INSERT for rollback: ${insertQuery}`);

		await db.query(insertQuery);

		console.log(
			`Rolled back to version ${version} for collection ${collection} in the 'down' direction.`
		);
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log(
				`No further DOWN migration file found for collection '${collection}' at version ${version}.`
			);
			return false; // Stop further processing for this collection
		} else {
			console.error(
				`Error applying DOWN migration or inserting history for collection '${collection}': ${error.message}`
			);
		}
	}
	return true; // Continue processing if no error
}

// Function to process all collections
async function processAllCollections(action) {
	const scriptDir = path.resolve('./migrations/scripts');
	const dirs = await fs.readdir(scriptDir, { withFileTypes: true });

	for (const dir of dirs) {
		if (dir.isDirectory()) {
			const collection = dir.name;
			const { version, direction } = await getLatestVersionAndDirection(collection);

			if (action === 'up') {
				// Apply migrations up sequentially
				let nextVersion = direction === 'down' ? version : version + 1;

				while (true) {
					const result = await migrateUp(collection, nextVersion);
					if (!result) break; // Stop if no further migrations are found
					nextVersion++;
				}
			} else if (action === 'down') {
				// Rollback migrations down sequentially
				let currentVersion = version;

				while (currentVersion >= 1) {
					const result = await migrateDown(collection, currentVersion);
					if (!result) break; // Stop if no further rollbacks are found
					currentVersion--;
				}

				if (currentVersion === 1) {
					console.log(
						`All migrations rolled back to version 1 for collection '${collection}'.`
					);
				}
			}
		}
	}

	console.log(`Processed all collections for action: ${action}.`);
}

// Main function to handle migration direction
async function main(action, collection) {
	await connectDB();

	await initializeMigrationTable();

	if (action === 'up' && collection) {
		if (collection === 'all') {
			await processAllCollections('up');
		} else {
			const { version, direction } = await getLatestVersionAndDirection(collection);
			let startVersion = direction === 'down' ? version : version + 1;
			while (true) {
				const result = await migrateUp(collection, startVersion);
				if (!result) break; // Stop if no further migrations are found
				startVersion++;
			}
		}
	} else if (action === 'down') {
		if (collection === 'all') {
			await processAllCollections('down');
		} else if (collection) {
			const { version, direction } = await getLatestVersionAndDirection(collection);
			if (version === 1 && direction === 'down') {
				console.log(
					`Already at the initial version (1, down), cannot rollback further for collection ${collection}.`
				);
			} else if (version >= 1) {
				let currentVersion = version;
				while (currentVersion >= 1) {
					const result = await migrateDown(collection, currentVersion);
					if (!result) break; // Stop if no further rollbacks are found
					currentVersion--;
				}
			} else {
				console.log(`No further rollback possible for collection ${collection}.`);
			}
		} else {
			console.log("Specify a collection name or 'all' to rollback.");
		}
	} else {
		console.log('Usage: node migrate.js {up|down} {collection_name|all}');
	}

	await db.close();
}

// Run the main function with command-line arguments
main(process.argv[2], process.argv[3]);
