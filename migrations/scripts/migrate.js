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
	const baseDir = path.join(__dirname, 'queries');

	const tableDirs = await fs.readdir(baseDir, { withFileTypes: true });
	const appliedMigrations = await getAppliedMigrations();

	for (const dirent of tableDirs) {
		if (!dirent.isDirectory()) continue;

		const tableName = dirent.name;
		const tableDir = path.join(baseDir, tableName);

		const files = await fs.readdir(tableDir);
		const directionMigrations = files.filter((file) => file.endsWith(`.${direction}.sql`));
		directionMigrations.sort(); // Ensure files are sorted by version

		const migrationStates = new Map(
			appliedMigrations
				.filter((m) => m.table_name === tableName)
				.map((m) => [m.version, m.up_or_down])
		);

		for (const file of directionMigrations) {
			const [versionStr] = file.split('_');
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
	const baseDir = path.join(__dirname, 'queries');
	const appliedMigrations = await getAppliedMigrations();

	const lastMigrationByTable = appliedMigrations.reduce((acc, migration) => {
		const { table_name, version, up_or_down } = migration;
		if (!acc[table_name] || acc[table_name].version < version) {
			acc[table_name] = { version, up_or_down };
		}
		return acc;
	}, {});

	for (const [tableName, { version, up_or_down }] of Object.entries(lastMigrationByTable)) {
		if (up_or_down === 'up') {
			const tableDir = path.join(baseDir, tableName);
			const file = `${version}_*.down.sql`; // Matches the format with the version
			const filePath = path.join(tableDir, file);

			console.log(`Rolling back table ${tableName} using ${file}`);
			await applyMigration(filePath, version, file, 'down', tableName);
		} else {
			console.log(`Skipping table ${tableName} as it is already rolled back.`);
		}
	}

	await db.query("DELETE FROM migration_history WHERE up_or_down = 'up';");
	console.log('Cleared "up" migrations from migration history.');

	await processMigrations('up');
}

function formatTimestamp() {
	const now = new Date();
	return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
}

async function createMigrationFiles(tableName, description = 'migration') {
	const tableDir = path.join(__dirname, 'queries', tableName);

	await fs.mkdir(tableDir, { recursive: true });

	const files = await fs.readdir(tableDir);
	const migrationNumbers = files
		.map((file) => parseInt(file.split('_')[0], 10))
		.filter(Number.isInteger)
		.sort((a, b) => a - b);

	const latestMigrationNumber = migrationNumbers.length ? migrationNumbers.pop() : 0;
	const newMigrationNumber = latestMigrationNumber + 1;
	const timestamp = formatTimestamp();
	const formattedDescription = description.replace(/\s+/g, '_');

	const upFilePath = path.join(
		tableDir,
		`${newMigrationNumber}_${timestamp}_${formattedDescription}.up.sql`
	);
	const downFilePath = path.join(
		tableDir,
		`${newMigrationNumber}_${timestamp}_${formattedDescription}.down.sql`
	);

	await fs.writeFile(
		upFilePath,
		`-- Write your SQL migration up query here for ${tableName}`,
		'utf8'
	);
	await fs.writeFile(
		downFilePath,
		`-- Write your SQL migration down query here for ${tableName}`,
		'utf8'
	);

	console.log(`Created new migration files: ${upFilePath} and ${downFilePath}`);
}

(async function () {
	try {
		await connectDB();
		await createMigrationHistoryTable();

		const command = process.argv[2];
		console.log('command', command);

		if (command === 'up') {
			await processMigrations('up');
		} else if (command === 'down') {
			await processMigrations('down');
		} else if (command === 'reset') {
			await resetMigrations();
		} else if (command === 'create') {
			const tableName = process.argv[3];
			const description = process.argv[4] || 'migration';
			if (!tableName) {
				console.error('Please specify the table name for creating migrations.');
				process.exit(1);
			}
			await createMigrationFiles(tableName, description);
		} else {
			console.log('Usage: node migrate.js [up|down|reset|create :table-name :description]');
		}

		await db.close();
	} catch (error) {
		console.error('Migration error:', error);
		process.exit(1);
	}
})();
