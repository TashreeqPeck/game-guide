import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importGuide } from '../src/lib/server/guides/import.ts';
import { migrate } from '../src/lib/server/db/migrate.ts';
import { upsertUser } from '../src/lib/server/auth/users.ts';

const databasePath = process.env.DATABASE_PATH ?? './data/app.db';
process.env.DATABASE_PATH = databasePath;
process.env.AUTH_MODE = 'dev';
migrate();

const devEmail = process.env.DEV_USER_EMAIL ?? 'dev@localhost';
const userId = upsertUser({
	issuer: 'dev://localhost',
	sub: devEmail,
	email: devEmail,
	name: 'Dev User'
});

const here = path.dirname(fileURLToPath(import.meta.url));
const samplesDir = path.join(here, '..', 'samples');
const files = fs.readdirSync(samplesDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

for (const file of files) {
	const yamlText = fs.readFileSync(path.join(samplesDir, file), 'utf8');
	const result = importGuide(userId, yamlText);
	if (result.ok) {
		console.log(`Imported ${file}: guide ${result.guideId}`);
	} else {
		console.error(`Failed ${file}:`, result.errors);
		process.exitCode = 1;
	}
}