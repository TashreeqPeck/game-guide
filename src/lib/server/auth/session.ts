import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { getDb } from '../db/client';
import { sessions, users } from '../db/schema';
import { getEnv } from '../env';

const SESSION_COOKIE = 'gg_session';

export type SessionUser = {
	id: string;
	email: string;
	name: string;
};

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function getSessionCookieName(): string {
	return SESSION_COOKIE;
}

export function createSession(userId: string): { token: string; expiresAt: Date } {
	const env = getEnv();
	const token = randomBytes(32).toString('base64url');
	const tokenHash = hashToken(token);
	const expiresAt = new Date(Date.now() + env.sessionTtlDays * 86_400_000);
	getDb()
		.insert(sessions)
		.values({
			id: randomBytes(16).toString('hex'),
			userId,
			tokenHash,
			expiresAt
		})
		.run();
	return { token, expiresAt };
}

export function deleteSessionByToken(token: string): void {
	const tokenHash = hashToken(token);
	getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash)).run();
}

export function resolveSessionUser(token: string | undefined): SessionUser | null {
	if (token === undefined || token.length === 0) {
		return null;
	}
	const tokenHash = hashToken(token);
	const now = new Date();
	const row = getDb()
		.select({
			userId: users.id,
			email: users.email,
			name: users.name
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
		.get();

	if (row === undefined) {
		return null;
	}
	return { id: row.userId, email: row.email, name: row.name };
}