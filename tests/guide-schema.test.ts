import { describe, expect, it } from 'vitest';
import { collectDuplicateIdErrors, guideFileSchema } from '../src/lib/server/guides/schema';

describe('guideFileSchema', () => {
	it('accepts a valid guide', () => {
		const parsed = guideFileSchema.safeParse({
			game: { slug: 'g', title: 'G' },
			guide: { slug: 'guide', title: 'Guide' },
			sections: [
				{
					id: 'root',
					items: [{ id: 'item-1', text: 'Do thing' }]
				}
			]
		});
		expect(parsed.success).toBe(true);
	});

	it('rejects duplicate ids', () => {
		const dupes = collectDuplicateIdErrors([
			{
				id: 'a',
				items: [{ id: 'same', text: 'one' }],
				children: [{ id: 'child', items: [{ id: 'same', text: 'two' }] }]
			}
		]);
		expect(dupes.length).toBeGreaterThan(0);
	});
});