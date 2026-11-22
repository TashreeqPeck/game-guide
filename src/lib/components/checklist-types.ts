export type ChecklistItem = {
	id: string;
	text: string;
	notesHtml: string;
	tags: string[];
	checked: boolean;
};

export type ChecklistSection = {
	id: string;
	title: string | null;
	bodyHtml: string;
	items: ChecklistItem[];
	children: ChecklistSection[];
	total: number;
	checked: number;
};