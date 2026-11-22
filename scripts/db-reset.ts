import fs from 'node:fs';
import path from 'node:path';
import { migrate } from '../src/lib/server/db/migrate.ts';

const databasePath = process.env.DATABASE_PATH ?? './data/app.db';

if (fs.existsSync(databasePath)) {
	fs.unlinkSync(databasePath);
}

const dir = path.dirname(databasePath);
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

process.env.DATABASE_PATH = databasePath;
migrate();
console.log(`Reset database at ${databasePath}`);