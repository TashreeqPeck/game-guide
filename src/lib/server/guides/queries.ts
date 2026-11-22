import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { games, guides, items, playthroughs, sections } from '../db/schema';

export function listGamesForUser(userId: string) {
	return getDb().select().from(games).where(eq(games.ownerUserId, userId)).all();
}

export function getGameForUser(userId: string, gameSlug: string) {
	return getDb()
		.select()
		.from(games)
		.where(and(eq(games.ownerUserId, userId), eq(games.slug, gameSlug)))
		.get();
}

export function listGuidesForGame(userId: string, gameId: string) {
	return getDb()
		.select()
		.from(guides)
		.where(and(eq(guides.ownerUserId, userId), eq(guides.gameId, gameId)))
		.all();
}

export function getGuideForUser(userId: string, guideId: string) {
	return getDb()
		.select()
		.from(guides)
		.where(and(eq(guides.ownerUserId, userId), eq(guides.id, guideId)))
		.get();
}

export function listSectionsForGuide(guideId: string) {
	return getDb().select().from(sections).where(eq(sections.guideId, guideId)).all();
}

export function listItemsForGuide(guideId: string, includeRetired = false) {
	if (includeRetired) {
		return getDb().select().from(items).where(eq(items.guideId, guideId)).all();
	}
	return getDb()
		.select()
		.from(items)
		.where(and(eq(items.guideId, guideId), eq(items.retired, false)))
		.all();
}

export function listPlaythroughsForGuide(userId: string, guideId: string) {
	return getDb()
		.select()
		.from(playthroughs)
		.where(and(eq(playthroughs.userId, userId), eq(playthroughs.guideId, guideId)))
		.all();
}

export function getPlaythroughForUser(userId: string, playthroughId: string) {
	return getDb()
		.select()
		.from(playthroughs)
		.where(and(eq(playthroughs.userId, userId), eq(playthroughs.id, playthroughId)))
		.get();
}