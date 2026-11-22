import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	oidcIssuer: text('oidc_issuer').notNull(),
	oidcSub: text('oidc_sub').notNull(),
	email: text('email').notNull(),
	name: text('name').notNull()
}, (table) => [
	uniqueIndex('users_oidc_unique').on(table.oidcIssuer, table.oidcSub)
]);

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	tokenHash: text('token_hash').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
}, (table) => [index('sessions_user_id_idx').on(table.userId)]);

export const games = sqliteTable('games', {
	id: text('id').primaryKey(),
	ownerUserId: text('owner_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	slug: text('slug').notNull(),
	title: text('title').notNull()
}, (table) => [
	uniqueIndex('games_owner_slug_unique').on(table.ownerUserId, table.slug)
]);

export const guides = sqliteTable('guides', {
	id: text('id').primaryKey(),
	ownerUserId: text('owner_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	gameId: text('game_id')
		.notNull()
		.references(() => games.id, { onDelete: 'cascade' }),
	slug: text('slug').notNull(),
	title: text('title').notNull(),
	author: text('author'),
	source: text('source')
}, (table) => [
	uniqueIndex('guides_owner_game_slug_unique').on(table.ownerUserId, table.gameId, table.slug)
]);

export const sections = sqliteTable('sections', {
	id: text('id').notNull(),
	guideId: text('guide_id')
		.notNull()
		.references(() => guides.id, { onDelete: 'cascade' }),
	parentId: text('parent_id'),
	title: text('title'),
	bodyMd: text('body_md'),
	order: integer('order').notNull().default(0),
	retired: integer('retired', { mode: 'boolean' }).notNull().default(false)
}, (table) => [
	uniqueIndex('sections_guide_id_unique').on(table.guideId, table.id)
]);

export const items = sqliteTable('items', {
	id: text('id').notNull(),
	guideId: text('guide_id')
		.notNull()
		.references(() => guides.id, { onDelete: 'cascade' }),
	sectionId: text('section_id').notNull(),
	text: text('text').notNull(),
	notesMd: text('notes_md'),
	tags: text('tags').notNull().default('[]'),
	order: integer('order').notNull().default(0),
	retired: integer('retired', { mode: 'boolean' }).notNull().default(false)
}, (table) => [
	uniqueIndex('items_guide_id_unique').on(table.guideId, table.id),
	index('items_section_id_idx').on(table.guideId, table.sectionId)
]);

export const playthroughs = sqliteTable('playthroughs', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	guideId: text('guide_id')
		.notNull()
		.references(() => guides.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	lastItemId: text('last_item_id')
});

export const progressEvents = sqliteTable('progress_events', {
	id: text('id').primaryKey(),
	playthroughId: text('playthrough_id')
		.notNull()
		.references(() => playthroughs.id, { onDelete: 'cascade' }),
	itemId: text('item_id').notNull(),
	guideId: text('guide_id').notNull(),
	action: text('action', { enum: ['check', 'uncheck'] }).notNull(),
	at: integer('at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
}, (table) => [
	index('progress_events_playthrough_idx').on(table.playthroughId, table.at)
]);

export const itemState = sqliteTable(
	'item_state',
	{
		playthroughId: text('playthrough_id')
			.notNull()
			.references(() => playthroughs.id, { onDelete: 'cascade' }),
		itemId: text('item_id').notNull(),
		guideId: text('guide_id').notNull(),
		checked: integer('checked', { mode: 'boolean' }).notNull().default(false),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(table) => [uniqueIndex('item_state_unique').on(table.playthroughId, table.itemId)]
);

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	games: many(games),
	guides: many(guides),
	playthroughs: many(playthroughs)
}));

export const guidesRelations = relations(guides, ({ one, many }) => ({
	game: one(games, { fields: [guides.gameId], references: [games.id] }),
	sections: many(sections),
	items: many(items),
	playthroughs: many(playthroughs)
}));