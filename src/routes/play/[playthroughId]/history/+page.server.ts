import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db/client';
import { items, progressEvents } from '$lib/server/db/schema';
import { getGuideForUser, getPlaythroughForUser } from '$lib/server/guides/queries';
import { undoLastEvent } from '$lib/server/progress/service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id ?? '';
	const playthrough = getPlaythroughForUser(userId, params.playthroughId);
	if (playthrough === undefined) {
		error(404, 'Playthrough not found');
	}
	const guide = getGuideForUser(userId, playthrough.guideId);
	if (guide === undefined) {
		error(404, 'Guide not found');
	}

	const events = getDb()
		.select()
		.from(progressEvents)
		.where(eq(progressEvents.playthroughId, playthrough.id))
		.orderBy(desc(progressEvents.at))
		.limit(100)
		.all();

	const rows = events.map((event) => {
		const item = getDb()
			.select()
			.from(items)
			.where(eq(items.id, event.itemId))
			.get();
		return {
			id: event.id,
			action: event.action,
			at: event.at,
			itemText: item?.text ?? event.itemId
		};
	});

	return { playthrough, guide, events: rows };
};

export const actions: Actions = {
	undo: async ({ locals, params }) => {
		const userId = locals.user?.id ?? '';
		const playthrough = getPlaythroughForUser(userId, params.playthroughId);
		if (playthrough === undefined) {
			return fail(404, { message: 'Playthrough not found' });
		}
		const undone = undoLastEvent(playthrough.id);
		if (!undone) {
			return fail(400, { message: 'Nothing to undo' });
		}
		return { ok: true };
	}
};