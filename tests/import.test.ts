import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { importGuide } from '../src/lib/server/guides/import';
import { upsertUser } from '../src/lib/server/auth/users';
import { migrate } from '../src/lib/server/db/migrate';
import { closeDb } from '../src/lib/server/db/client';
import { resetEnvCache } from '../src/lib/server/env';

const dbPath = './data/test-import.db';

beforeEach(() => {
	closeDb();
	resetEnvCache();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
	process.env.DATABASE_PATH = dbPath;
	process.env.AUTH_MODE = 'dev';
	process.env.NODE_ENV = 'test';
	migrate();
});

afterEach(() => {
	closeDb();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
});

describe('importGuide', () => {
	it('imports sample guides', () => {
		const userId = upsertUser({
			issuer: 'dev://localhost',
			sub: 'test@local',
			email: 'test@local',
			name: 'Test'
		});
		const sample = fs.readFileSync(path.join('samples', 'example-game.yaml'), 'utf8');
		const first = importGuide(userId, sample);
		expect(first.ok).toBe(true);
		if (first.ok) {
			const second = importGuide(userId, sample);
			expect(second.ok).toBe(true);
			if (second.ok) {
				expect(second.updated).toBeGreaterThan(0);
			}
		}
	});

	it('rejects malformed yaml', () => {
		const userId = upsertUser({
			issuer: 'dev://localhost',
			sub: 'test2@local',
			email: 'test2@local',
			name: 'Test'
		});
		const bad = importGuide(userId, ':::not yaml');
		expect(bad.ok).toBe(false);
	});

	it('isolates users', () => {
		const a = upsertUser({
			issuer: 'dev://localhost',
			sub: 'a@local',
			email: 'a@local',
			name: 'A'
		});
		const b = upsertUser({
			issuer: 'dev://localhost',
			sub: 'b@local',
			email: 'b@local',
			name: 'B'
		});
		const sample = fs.readFileSync(path.join('samples', 'example-game.yaml'), 'utf8');
		const first = importGuide(a, sample);
		const second = importGuide(b, sample.replace('Example Game', 'Example Game B'));
		expect(first.ok && second.ok).toBe(true);
	});
});