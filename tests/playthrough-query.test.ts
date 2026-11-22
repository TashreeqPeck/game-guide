import { describe, expect, it } from 'vitest';
import { playthroughListQuery } from '../src/lib/playthrough-query';

describe('playthroughListQuery', () => {
	it('returns empty string when no filters', () => {
		expect(playthroughListQuery('', false)).toBe('');
	});

	it('includes hideCompleted and tag when set', () => {
		const qs = playthroughListQuery('story', true);
		expect(qs).toContain('hideCompleted=1');
		expect(qs).toContain('tag=story');
	});
});