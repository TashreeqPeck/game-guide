export type SectionNode = {
	id: string;
	title: string | null;
	bodyHtml: string;
	children: SectionNode[];
};