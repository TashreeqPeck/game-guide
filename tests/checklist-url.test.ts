import { describe, expect, it } from 'vitest';
import { buildToggleAction } from '../src/lib/components/checklist-url';

describe('buildToggleAction', () => {
	it('preserves active filters in the named action URL', () => {
		const action = buildToggleAction('Main story', true);
		const params = new URLSearchParams(action.slice(1));

		expect(params.get('/toggle')).toBe('');
		expect(params.get('tag')).toBe('Main story');
		expect(params.get('hideCompleted')).toBe('1');
	});

	it('omits inactive filters', () => {
		expect(buildToggleAction('', false)).toBe('?/toggle');
	});
});
