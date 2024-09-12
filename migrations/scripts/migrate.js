import Surreal from 'surrealdb.js';
import { config } from 'dotenv-flow';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

// ESM-compatible way to get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function createMigrationHistoryTable() {
	// Define the migration_history table schema with correct datetime handling
	await db.query(`
        DEFINE TABLE migration_history SCHEMAFULL
            PERMISSIONS FULL;
        DEFINE FIELD version ON migration_history TYPE int;
        DEFINE FIELD createdAt ON migration_history TYPE datetime VALUE $before OR time::now();
        DEFINE FIELD migration_name ON migration_history TYPE string;
        DEFINE FIELD up_or_down ON migration_history TYPE string ASSERT $value IN ['up', 'down'];
        DEFINE FIELD table_name ON migration_history TYPE string;
    `);
	console.log('Ensured migration_history table exists.');
}

async function getAppliedMigrations() {
	const [records] = await db.query('SELECT * FROM migration_history ORDER BY version ASC');
	return records.map((r) => ({
		version: r.version,
		up_or_down: r.up_or_down,
		table_name: r.table_name
	}));
}

async function applyMigration(filePath, version, name, direction, tableName) {
	const content = await fs.readFile(filePath, 'utf8');
	await db.query(content);
	await db.create('migration_history', {
		version,
		createdAt: new Date().toISOString(),
		migration_name: name,
		up_or_down: direction,
		table_name: tableName
	});
	console.log(`Applied ${direction} migration for table ${tableName}: ${name}`);
}

async function processMigrations(direction = 'up') {
	const baseDir = path.join(__dirname, 'queries'); // Go to the 'queries' directory within 'migrations/scripts'

	// Get all table directories
	const tableDirs = await fs.readdir(baseDir, { withFileTypes: true });
	const appliedMigrations = await getAppliedMigrations();

	for (const dirent of tableDirs) {
		if (!dirent.isDirectory()) continue;

		const tableName = dirent.name;
		const tableDir = path.join(baseDir, tableName);

		// Find migrations for this table
		const files = await fs.readdir(tableDir);
		const directionMigrations = files.filter((file) => file.endsWith(`.${direction}.query`));
		directionMigrations.sort(); // Ensure files are sorted by version

		// Get the latest migration state for each table
		const migrationStates = new Map(
			appliedMigrations
				.filter((m) => m.table_name === tableName)
				.map((m) => [m.version, m.up_or_down])
		);

		// Apply or rollback migrations
		for (const file of directionMigrations) {
			const [versionStr] = file.split('.');
			const version = parseInt(versionStr, 10);

			if (
				(direction === 'up' &&
					(!migrationStates.has(version) || migrationStates.get(version) === 'down')) ||
				(direction === 'down' && migrationStates.get(version) === 'up')
			) {
				const filePath = path.join(tableDir, file);
				await applyMigration(filePath, version, file, direction, tableName);
			} else {
				console.log(`Skipping ${file} as it is not applicable for the current direction.`);
			}
		}
	}
}

async function resetMigrations() {
	const baseDir = path.join(__dirname, 'queries'); // Go to the 'queries' directory within 'migrations/scripts'
	const appliedMigrations = await getAppliedMigrations();

	// Find the most recent migration for each table
	const lastMigrationByTable = appliedMigrations.reduce((acc, migration) => {
		const { table_name, version, up_or_down } = migration;
		if (!acc[table_name] || acc[table_name].version < version) {
			acc[table_name] = { version, up_or_down };
		}
		return acc;
	}, {});

	// Process rollback for each table where the last migration was an "up"
	for (const [tableName, { version, up_or_down }] of Object.entries(lastMigrationByTable)) {
		if (up_or_down === 'up') {
			const tableDir = path.join(baseDir, tableName);
			const file = `${version}.down.query`;
			const filePath = path.join(tableDir, file);

			console.log(`Rolling back table ${tableName} using ${file}`);
			await applyMigration(filePath, version, file, 'down', tableName);
		} else {
			console.log(`Skipping table ${tableName} as it is already rolled back.`);
		}
	}

	// After rolling back, delete only the "up" migrations from history
	await db.query("DELETE FROM migration_history WHERE up_or_down = 'up';");
	console.log('Cleared "up" migrations from migration history.');

	// Re-apply all up migrations
	await processMigrations('up');
}

(async function () {
	try {
		await connectDB();
		await createMigrationHistoryTable(); // Ensure the table exists

		const command = process.argv[2];

		if (command === 'up') {
			await processMigrations('up');
		} else if (command === 'down') {
			await processMigrations('down');
		} else if (command === 'reset') {
			await resetMigrations();
		} else {
			console.log('Usage: node migrate.js [up|down|reset]');
		}

		await db.close();
	} catch (error) {
		console.error('Migration error:', error);
		process.exit(1);
	}
})();
