import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { parse as parseYaml } from 'yaml';
import { getDb } from '../db/client';
import { games, guides, items, sections } from '../db/schema';
import {
	collectDuplicateIdErrors,
	flattenGuideSections,
	formatZodErrors,
	guideFileSchema,
	type FlatItem,
	type FlatSection,
	type GuideFile
} from './schema';

export type ImportSuccess = {
	ok: true;
	guideId: string;
	gameSlug: string;
	guideSlug: string;
	added: number;
	updated: number;
	retired: number;
};

export type ImportFailure = {
	ok: false;
	errors: string[];
};

export type ImportResult = ImportSuccess | ImportFailure;

function parseGuideYaml(yamlText: string): ImportFailure | GuideFile {
	let parsed: unknown;
	try {
		parsed = parseYaml(yamlText, {
			maxAliasCount: 10,
			merge: false,
			schema: 'failsafe'
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { ok: false, errors: [`yaml: ${message}`] };
	}

	const validated = guideFileSchema.safeParse(parsed);
	if (!validated.success) {
		return { ok: false, errors: formatZodErrors(validated.error) };
	}

	const duplicateErrors = collectDuplicateIdErrors(validated.data.sections);
	if (duplicateErrors.length > 0) {
		return { ok: false, errors: duplicateErrors };
	}

	return validated.data;
}

export function importGuide(userId: string, yamlText: string): ImportResult {
	const parsed = parseGuideYaml(yamlText);
	if ('ok' in parsed && parsed.ok === false) {
		return parsed;
	}
	const guideFile = parsed as GuideFile;

	const flatSections: FlatSection[] = [];
	const flatItems: FlatItem[] = [];
	flattenGuideSections(guideFile.sections, null, flatSections, flatItems);

	const db = getDb();
	let added = 0;
	let updated = 0;
	let retired = 0;
	let guideId = '';

	const transactionResult = db.transaction((tx) => {
		let gameRow = tx
			.select()
			.from(games)
			.where(and(eq(games.ownerUserId, userId), eq(games.slug, guideFile.game.slug)))
			.get();

		if (gameRow === undefined) {
			const gameId = randomUUID();
			tx.insert(games)
				.values({
					id: gameId,
					ownerUserId: userId,
					slug: guideFile.game.slug,
					title: guideFile.game.title
				})
				.run();
			gameRow = {
				id: gameId,
				ownerUserId: userId,
				slug: guideFile.game.slug,
				title: guideFile.game.title
			};
		} else if (gameRow.title !== guideFile.game.title) {
			tx.update(games)
				.set({ title: guideFile.game.title })
				.where(eq(games.id, gameRow.id))
				.run();
		}

		const guideRow = tx
			.select()
			.from(guides)
			.where(
				and(
					eq(guides.ownerUserId, userId),
					eq(guides.gameId, gameRow.id),
					eq(guides.slug, guideFile.guide.slug)
				)
			)
			.get();

		if (guideRow === undefined) {
			guideId = randomUUID();
			tx.insert(guides)
				.values({
					id: guideId,
					ownerUserId: userId,
					gameId: gameRow.id,
					slug: guideFile.guide.slug,
					title: guideFile.guide.title,
					author: guideFile.guide.author ?? null,
					source: guideFile.guide.source ?? null
				})
				.run();
		} else {
			guideId = guideRow.id;
			tx.update(guides)
				.set({
					title: guideFile.guide.title,
					author: guideFile.guide.author ?? null,
					source: guideFile.guide.source ?? null
				})
				.where(eq(guides.id, guideId))
				.run();
		}

		const existingSections = tx.select().from(sections).where(eq(sections.guideId, guideId)).all();
		const existingItems = tx.select().from(items).where(eq(items.guideId, guideId)).all();

		const incomingSectionIds = new Set(flatSections.map((s) => s.id));
		const incomingItemIds = new Set(flatItems.map((i) => i.id));

		for (const section of flatSections) {
			const existing = existingSections.find((s) => s.id === section.id);
			if (existing === undefined) {
				tx.insert(sections)
					.values({
						id: section.id,
						guideId,
						parentId: section.parentId,
						title: section.title,
						bodyMd: section.bodyMd,
						order: section.order,
						retired: false
					})
					.run();
				added += 1;
			} else {
				tx.update(sections)
					.set({
						parentId: section.parentId,
						title: section.title,
						bodyMd: section.bodyMd,
						order: section.order,
						retired: false
					})
					.where(and(eq(sections.guideId, guideId), eq(sections.id, section.id)))
					.run();
				updated += 1;
			}
		}

		for (const item of flatItems) {
			const existing = existingItems.find((i) => i.id === item.id);
			const tagsJson = JSON.stringify(item.tags);
			if (existing === undefined) {
				tx.insert(items)
					.values({
						id: item.id,
						guideId,
						sectionId: item.sectionId,
						text: item.text,
						notesMd: item.notesMd,
						tags: tagsJson,
						order: item.order,
						retired: false
					})
					.run();
				added += 1;
			} else {
				tx.update(items)
					.set({
						sectionId: item.sectionId,
						text: item.text,
						notesMd: item.notesMd,
						tags: tagsJson,
						order: item.order,
						retired: false
					})
					.where(and(eq(items.guideId, guideId), eq(items.id, item.id)))
					.run();
				updated += 1;
			}
		}

		for (const section of existingSections) {
			if (!incomingSectionIds.has(section.id) && !section.retired) {
				tx.update(sections)
					.set({ retired: true })
					.where(and(eq(sections.guideId, guideId), eq(sections.id, section.id)))
					.run();
				retired += 1;
			}
		}

		for (const item of existingItems) {
			if (!incomingItemIds.has(item.id) && !item.retired) {
				tx.update(items)
					.set({ retired: true })
					.where(and(eq(items.guideId, guideId), eq(items.id, item.id)))
					.run();
				retired += 1;
			}
		}

		return {
			guideId,
			gameSlug: guideFile.game.slug,
			guideSlug: guideFile.guide.slug
		};
	});

	return {
		ok: true,
		guideId: transactionResult.guideId,
		gameSlug: transactionResult.gameSlug,
		guideSlug: transactionResult.guideSlug,
		added,
		updated,
		retired
	};
}