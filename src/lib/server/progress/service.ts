import { and, desc, eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/client';
import { itemState, items, playthroughs, progressEvents } from '../db/schema';

export type CompletionStats = {
	total: number;
	checked: number;
	percent: number;
};

export function countActiveItems(guideId: string): number {
	const row = getDb()
		.select({ count: sql<number>`count(*)` })
		.from(items)
		.where(and(eq(items.guideId, guideId), eq(items.retired, false)))
		.get();
	return row?.count ?? 0;
}

export function getCompletionForPlaythrough(playthroughId: string, guideId: string): CompletionStats {
	const total = countActiveItems(guideId);
	const checkedRow = getDb()
		.select({ count: sql<number>`count(*)` })
		.from(itemState)
		.where(
			and(
				eq(itemState.playthroughId, playthroughId),
				eq(itemState.guideId, guideId),
				eq(itemState.checked, true)
			)
		)
		.get();
	const checked = checkedRow?.count ?? 0;
	const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
	return { total, checked, percent };
}

export function setItemChecked(
	playthroughId: string,
	guideId: string,
	itemId: string,
	checked: boolean
): void {
	const db = getDb();
	const action = checked ? 'check' : 'uncheck';
	const now = new Date();
	db.transaction((tx) => {
		tx.insert(progressEvents)
			.values({
				id: randomUUID(),
				playthroughId,
				guideId,
				itemId,
				action,
				at: now
			})
			.run();
		const existing = tx
			.select()
			.from(itemState)
			.where(and(eq(itemState.playthroughId, playthroughId), eq(itemState.itemId, itemId)))
			.get();
		if (existing === undefined) {
			tx.insert(itemState)
				.values({
					playthroughId,
					guideId,
					itemId,
					checked,
					updatedAt: now
				})
				.run();
		} else {
			tx.update(itemState)
				.set({ checked, updatedAt: now })
				.where(and(eq(itemState.playthroughId, playthroughId), eq(itemState.itemId, itemId)))
				.run();
		}
		tx.update(playthroughs)
			.set({ lastItemId: itemId })
			.where(eq(playthroughs.id, playthroughId))
			.run();
	});
}

export function undoLastEvent(playthroughId: string): boolean {
	const db = getDb();
	const last = db
		.select()
		.from(progressEvents)
		.where(eq(progressEvents.playthroughId, playthroughId))
		.orderBy(desc(progressEvents.at))
		.limit(1)
		.get();

	let undone = false;
	if (last !== undefined) {
		const revertChecked = last.action !== 'check';
		db.transaction((tx) => {
			const existing = tx
				.select()
				.from(itemState)
				.where(and(eq(itemState.playthroughId, playthroughId), eq(itemState.itemId, last.itemId)))
				.get();
			if (existing === undefined) {
				tx.insert(itemState)
					.values({
						playthroughId,
						guideId: last.guideId,
						itemId: last.itemId,
						checked: revertChecked,
						updatedAt: new Date()
					})
					.run();
			} else {
				tx.update(itemState)
					.set({ checked: revertChecked, updatedAt: new Date() })
					.where(and(eq(itemState.playthroughId, playthroughId), eq(itemState.itemId, last.itemId)))
					.run();
			}
			tx.delete(progressEvents).where(eq(progressEvents.id, last.id)).run();
		});
		undone = true;
	}
	return undone;
}

export function createPlaythrough(userId: string, guideId: string, name: string): string {
	const id = randomUUID();
	getDb()
		.insert(playthroughs)
		.values({
			id,
			userId,
			guideId,
			name,
			createdAt: new Date()
		})
		.run();
	return id;
}