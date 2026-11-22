import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getGameForUser, listGuidesForGame, listPlaythroughsForGuide } from '$lib/server/guides/queries';
import { getCompletionForPlaythrough } from '$lib/server/progress/service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id ?? '';
	const game = getGameForUser(userId, params.game);
	if (game === undefined) {
		error(404, 'Game not found');
	}
	const guides = listGuidesForGame(userId, game.id).map((guide) => {
		const playthroughs = listPlaythroughsForGuide(userId, guide.id).map((pt) => {
			const stats = getCompletionForPlaythrough(pt.id, guide.id);
			return {
				id: pt.id,
				name: pt.name,
				percent: stats.percent
			};
		});
		return {
			id: guide.id,
			slug: guide.slug,
			title: guide.title,
			author: guide.author,
			source: guide.source,
			playthroughs
		};
	});
	return { game, guides };
};