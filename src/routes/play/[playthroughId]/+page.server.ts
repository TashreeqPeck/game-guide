import { error, fail, redirect } from '@sveltejs/kit';
import { playthroughListQuery } from '$lib/playthrough-query';
import type { Actions, PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { itemState, items } from '$lib/server/db/schema';
import {
	getGuideForUser,
	getPlaythroughForUser,
	listSectionsForGuide
} from '$lib/server/guides/queries';
import { renderMarkdown } from '$lib/server/markdown';
import { getCompletionForPlaythrough, setItemChecked } from '$lib/server/progress/service';

type ChecklistItem = {
	id: string;
	text: string;
	notesHtml: string;
	tags: string[];
	checked: boolean;
};

type ChecklistSection = {
	id: string;
	title: string | null;
	bodyHtml: string;
	items: ChecklistItem[];
	children: ChecklistSection[];
	total: number;
	checked: number;
};

function parseTags(tagsJson: string): string[] {
	try {
		const parsed = JSON.parse(tagsJson) as unknown;
		if (Array.isArray(parsed)) {
			return parsed.map(String);
		}
	} catch {
		return [];
	}
	return [];
}

function buildChecklist(
	allSections: ReturnType<typeof listSectionsForGuide>,
	sectionItems: Map<string, ChecklistItem[]>,
	parentId: string | null
): ChecklistSection[] {
	return allSections
		.filter((section) => section.parentId === parentId && !section.retired)
		.sort((a, b) => a.order - b.order)
		.map((section) => {
			const children = buildChecklist(allSections, sectionItems, section.id);
			const itemsForSection = sectionItems.get(section.id) ?? [];
			let total = itemsForSection.length;
			let checked = itemsForSection.filter((item) => item.checked).length;
			children.forEach((child) => {
				total += child.total;
				checked += child.checked;
			});
			return {
				id: section.id,
				title: section.title,
				bodyHtml: renderMarkdown(section.bodyMd),
				items: itemsForSection,
				children,
				total,
				checked
			};
		});
}

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const userId = locals.user?.id ?? '';
	const playthrough = getPlaythroughForUser(userId, params.playthroughId);
	if (playthrough === undefined) {
		error(404, 'Playthrough not found');
	}
	const guide = getGuideForUser(userId, playthrough.guideId);
	if (guide === undefined) {
		error(404, 'Guide not found');
	}

	const guideItems = getDb()
		.select()
		.from(items)
		.where(and(eq(items.guideId, guide.id), eq(items.retired, false)))
		.all();
	const states = getDb()
		.select()
		.from(itemState)
		.where(eq(itemState.playthroughId, playthrough.id))
		.all();
	const checkedByItem = new Map(states.map((row) => [row.itemId, row.checked]));

	const sectionItems = new Map<string, ChecklistItem[]>();
	guideItems
		.sort((a, b) => a.order - b.order)
		.forEach((item) => {
			const checklistItem: ChecklistItem = {
				id: item.id,
				text: item.text,
				notesHtml: renderMarkdown(item.notesMd),
				tags: parseTags(item.tags),
				checked: checkedByItem.get(item.id) === true
			};
			const bucket = sectionItems.get(item.sectionId) ?? [];
			bucket.push(checklistItem);
			sectionItems.set(item.sectionId, bucket);
		});

	const allSections = listSectionsForGuide(guide.id);
	const checklist = buildChecklist(allSections, sectionItems, null);
	const stats = getCompletionForPlaythrough(playthrough.id, guide.id);

	const tagSet = new Set<string>();
	guideItems.forEach((item) => parseTags(item.tags).forEach((tag) => tagSet.add(tag)));
	const allTags = [...tagSet].sort();

	let firstUncheckedId: string | null = null;
	for (const item of guideItems) {
		const checked = checkedByItem.get(item.id) ?? false;
		if (!checked) {
			firstUncheckedId = item.id;
			break;
		}
	}

	const filterTag = url.searchParams.get('tag') ?? '';
	const hideCompleted = url.searchParams.get('hideCompleted') === '1';

	return {
		playthrough,
		guide,
		checklist,
		stats,
		allTags,
		filterTag,
		hideCompleted,
		firstUncheckedId
	};
};

export const actions: Actions = {
	toggle: async ({ request, locals, params, url }) => {
		const userId = locals.user?.id ?? '';
		const playthrough = getPlaythroughForUser(userId, params.playthroughId);
		if (playthrough === undefined) {
			return fail(404, { message: 'Playthrough not found' });
		}
		const form = await request.formData();
		const itemId = String(form.get('itemId') ?? '');
		const checked = String(form.get('checked') ?? '0') === '1';
		const filterTag = String(form.get('filterTag') ?? '');
		const hideCompleted = String(form.get('hideCompleted') ?? '') === '1';
		const exists = getDb()
			.select()
			.from(items)
			.where(and(eq(items.guideId, playthrough.guideId), eq(items.id, itemId), eq(items.retired, false)))
			.get();
		if (exists === undefined) {
			return fail(404, { message: 'Item not found' });
		}
		setItemChecked(playthrough.id, playthrough.guideId, itemId, checked);
		const listQuery = playthroughListQuery(filterTag, hideCompleted);
		throw redirect(303, `${url.pathname}${listQuery}`);
	}
};