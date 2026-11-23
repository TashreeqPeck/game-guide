import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/lib/server/markdown';

describe('renderMarkdown', () => {
	it('renders markdown formatting and GFM tables in section descriptions', () => {
		const html = renderMarkdown(
			'A **bold** description.\n\n| Item | Value |\n|------|-------|\n| Stat | 99 |'
		);

		expect(html).toContain('<strong>bold</strong>');
		expect(html).toContain('<table>');
		expect(html).toContain('<th>Item</th>');
	});

	it('sanitizes unsafe HTML in descriptions', () => {
		const html = renderMarkdown('Safe text <script>alert(1)</script>');

		expect(html).toContain('Safe text');
		expect(html).not.toContain('<script>');
	});

	it('returns an empty string for empty descriptions', () => {
		expect(renderMarkdown('  ')).toBe('');
	});
});
