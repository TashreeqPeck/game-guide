import type { PageServerLoad } from './$types';
import { listGamesForUser, listGuidesForGame } from '$lib/server/guides/queries';
import { getCompletionForPlaythrough, countActiveItems } from '$lib/server/progress/service';
import { getDb } from '$lib/server/db/client';
import { playthroughs } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? '';
	const games = listGamesForUser(userId);
	const summaries = games.map((game) => {
		const guides = listGuidesForGame(userId, game.id);
		let totalItems = 0;
		let latestPercent = 0;
		guides.forEach((guide) => {
			totalItems += countActiveItems(guide.id);
			const latest = getDb()
				.select()
				.from(playthroughs)
				.where(and(eq(playthroughs.userId, userId), eq(playthroughs.guideId, guide.id)))
				.orderBy(desc(playthroughs.createdAt))
				.limit(1)
				.get();
			if (latest !== undefined) {
				const stats = getCompletionForPlaythrough(latest.id, guide.id);
				latestPercent = Math.max(latestPercent, stats.percent);
			}
		});
		return {
			id: game.id,
			slug: game.slug,
			title: game.title,
			guideCount: guides.length,
			totalItems,
			latestPercent
		};
	});
	return { games: summaries };
};