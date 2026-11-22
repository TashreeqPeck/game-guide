import { describe, expect, it } from 'vitest';
import lint from '@commitlint/lint';
import defaultConfig from '@commitlint/config-conventional';
import userConfig from '../commitlint.config.js';

const rules = {
	...defaultConfig.rules,
	...userConfig.rules
} as unknown as Parameters<typeof lint>[1];

describe('commitlint rules', () => {
	it('accepts valid messages', async () => {
		const messages = ['feat(import): add yaml upload', 'chore(deps): bump vitest'];
		for (const message of messages) {
			const result = await lint(message, rules);
			expect(result.valid).toBe(true);
		}
	});

	it('rejects invalid messages', async () => {
		const messages = ['feat(import): Add bad subject.', 'wip: unknown type'];
		for (const message of messages) {
			const result = await lint(message, rules);
			expect(result.valid).toBe(false);
		}
	});
});