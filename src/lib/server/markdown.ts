import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(md: string | null | undefined): string {
	if (md === null || md === undefined || md.trim() === '') {
		return '';
	}
	const raw = marked.parse(md, { async: false }) as string;
	return DOMPurify.sanitize(raw);
}