import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { importGuide } from '../src/lib/server/guides/import';
import { upsertUser } from '../src/lib/server/auth/users';
import { migrate } from '../src/lib/server/db/migrate';
import { closeDb } from '../src/lib/server/db/client';
import { resetEnvCache } from '../src/lib/server/env';
import {
	createPlaythrough,
	getCompletionForPlaythrough,
	setItemChecked,
	undoLastEvent
} from '../src/lib/server/progress/service';

const dbPath = './data/test-progress.db';

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

describe('progress service', () => {
	it('tracks completion and undo', () => {
		const userId = upsertUser({
			issuer: 'dev://localhost',
			sub: 'progress@local',
			email: 'progress@local',
			name: 'Progress'
		});
		const yaml = `game: { slug: g, title: G }
guide: { slug: guide, title: Guide }
sections:
  - id: sec
    items:
      - id: item-1
        text: one
      - id: item-2
        text: two`;
		const imported = importGuide(userId, yaml);
		expect(imported.ok).toBe(true);
		if (imported.ok) {
			const playthroughId = createPlaythrough(userId, imported.guideId, 'Run 1');
			setItemChecked(playthroughId, imported.guideId, 'item-1', true);
			let stats = getCompletionForPlaythrough(playthroughId, imported.guideId);
			expect(stats.checked).toBe(1);
			expect(stats.percent).toBe(50);
			undoLastEvent(playthroughId);
			stats = getCompletionForPlaythrough(playthroughId, imported.guideId);
			expect(stats.checked).toBe(0);
		}
	});
});