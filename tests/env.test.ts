import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv, resetEnvCache } from '../src/lib/server/env';

afterEach(() => {
	resetEnvCache();
});

describe('loadEnv', () => {
	it('refuses dev auth in production', () => {
		process.env.AUTH_MODE = 'dev';
		process.env.NODE_ENV = 'production';
		let threw = false;
		try {
			loadEnv();
		} catch {
			threw = true;
		}
		expect(threw).toBe(true);
	});

	it('allows dev auth in development', () => {
		process.env.AUTH_MODE = 'dev';
		process.env.NODE_ENV = 'development';
		const env = loadEnv();
		expect(env.authMode).toBe('dev');
	});
});