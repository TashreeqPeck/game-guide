import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getGuideForUser,
	listItemsForGuide,
	listPlaythroughsForGuide,
	listSectionsForGuide
} from '$lib/server/guides/queries';
import { createPlaythrough } from '$lib/server/progress/service';
import { renderMarkdown } from '$lib/server/markdown';

type SectionNode = {
	id: string;
	title: string | null;
	bodyHtml: string;
	children: SectionNode[];
};

function buildSectionTree(
	sections: ReturnType<typeof listSectionsForGuide>,
	parentId: string | null
): SectionNode[] {
	return sections
		.filter((s) => s.parentId === parentId && !s.retired)
		.sort((a, b) => a.order - b.order)
		.map((section) => ({
			id: section.id,
			title: section.title,
			bodyHtml: renderMarkdown(section.bodyMd),
			children: buildSectionTree(sections, section.id)
		}));
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id ?? '';
	const guide = getGuideForUser(userId, params.guide);
	if (guide === undefined) {
		error(404, 'Guide not found');
	}
	const sections = listSectionsForGuide(guide.id);
	const items = listItemsForGuide(guide.id);
	const playthroughs = listPlaythroughsForGuide(userId, guide.id);
	return {
		guide,
		sectionTree: buildSectionTree(sections, null),
		itemCount: items.length,
		playthroughs
	};
};

export const actions: Actions = {
	createPlaythrough: async ({ request, locals, params }) => {
		const userId = locals.user?.id ?? '';
		const guide = getGuideForUser(userId, params.guide);
		if (guide === undefined) {
			return fail(404, { message: 'Guide not found' });
		}
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (name.length === 0) {
			return fail(400, { message: 'Playthrough name is required' });
		}
		const playthroughId = createPlaythrough(userId, guide.id, name);
		throw redirect(303, `/play/${playthroughId}`);
	}
};