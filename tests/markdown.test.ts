import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/lib/server/markdown';

describe('renderMarkdown', () => {
	it('renders common Markdown formatting', () => {
		const html = renderMarkdown('## Heading\n\n**Important**\n\n- First\n- Second');

		expect(html).toContain('<h2>Heading</h2>');
		expect(html).toContain('<strong>Important</strong>');
		expect(html).toContain('<ul>');
		expect(html).toContain('<li>First</li>');
	});

	it('sanitizes unsafe HTML', () => {
		const html = renderMarkdown('<img src=x onerror=alert(1)>');

		expect(html).not.toContain('onerror');
	});
});
