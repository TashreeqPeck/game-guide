import { z } from 'zod';

const baseItemSchema = z.object({
	id: z.string().min(1),
	text: z.string().min(1),
	notes_md: z.string().optional(),
	tags: z.array(z.string()).optional(),
	order: z.number().int().optional()
});

type SectionInput = {
	id: string;
	title?: string;
	body_md?: string;
	children?: SectionInput[];
	items?: z.infer<typeof baseItemSchema>[];
};

const sectionSchema: z.ZodType<SectionInput> = z.lazy(() =>
	z.object({
		id: z.string().min(1),
		title: z.string().optional(),
		body_md: z.string().optional(),
		children: z.array(sectionSchema).optional(),
		items: z.array(baseItemSchema).optional()
	})
);

export const guideFileSchema = z.object({
	game: z.object({
		slug: z.string().min(1),
		title: z.string().min(1)
	}),
	guide: z
		.object({
			slug: z.string().min(1),
			title: z.string().min(1),
			author: z.string().optional(),
			source: z.string().url().optional().or(z.literal(''))
		})
		.transform((g) => ({
			...g,
			source: g.source === '' ? undefined : g.source
		})),
	sections: z.array(sectionSchema).min(1)
});

export type GuideFile = z.infer<typeof guideFileSchema>;

export type FlatSection = {
	id: string;
	parentId: string | null;
	title: string | null;
	bodyMd: string | null;
	order: number;
};

export type FlatItem = {
	id: string;
	sectionId: string;
	text: string;
	notesMd: string | null;
	tags: string[];
	order: number;
};

export function flattenGuideSections(
	sections: SectionInput[],
	parentId: string | null,
	outSections: FlatSection[],
	outItems: FlatItem[]
): void {
	sections.forEach((section, index) => {
		outSections.push({
			id: section.id,
			parentId,
			title: section.title ?? null,
			bodyMd: section.body_md ?? null,
			order: index
		});
		if (section.items) {
			section.items.forEach((item, itemIndex) => {
				const order = item.order ?? itemIndex;
				outItems.push({
					id: item.id,
					sectionId: section.id,
					text: item.text,
					notesMd: item.notes_md ?? null,
					tags: item.tags ?? [],
					order
				});
			});
		}
		if (section.children) {
			flattenGuideSections(section.children, section.id, outSections, outItems);
		}
	});
}

export function collectDuplicateIdErrors(sections: SectionInput[]): string[] {
	const seen = new Set<string>();
	const errors: string[] = [];

	function walk(nodes: SectionInput[], path: string): void {
		nodes.forEach((node, index) => {
			const here = `${path}[${index}]`;
			if (seen.has(node.id)) {
				errors.push(`${here}.id: duplicate id "${node.id}"`);
			} else {
				seen.add(node.id);
			}
			if (node.items) {
				node.items.forEach((item, itemIndex) => {
					const itemPath = `${here}.items[${itemIndex}]`;
					if (seen.has(item.id)) {
						errors.push(`${itemPath}.id: duplicate id "${item.id}"`);
					} else {
						seen.add(item.id);
					}
				});
			}
			if (node.children) {
				walk(node.children, `${here}.children`);
			}
		});
	}

	walk(sections, 'sections');
	return errors;
}

export function formatZodErrors(error: z.ZodError): string[] {
	return error.issues.map((issue) => {
		const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
		return `${path}: ${issue.message}`;
	});
}