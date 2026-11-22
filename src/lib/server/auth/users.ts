import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/client';
import { users } from '../db/schema';

export type OidcIdentity = {
	issuer: string;
	sub: string;
	email: string;
	name: string;
};

export function upsertUser(identity: OidcIdentity): string {
	const db = getDb();
	const existing = db
		.select()
		.from(users)
		.where(and(eq(users.oidcIssuer, identity.issuer), eq(users.oidcSub, identity.sub)))
		.get();

	if (existing !== undefined) {
		db.update(users)
			.set({ email: identity.email, name: identity.name })
			.where(eq(users.id, existing.id))
			.run();
		return existing.id;
	}

	const id = randomUUID();
	db.insert(users)
		.values({
			id,
			oidcIssuer: identity.issuer,
			oidcSub: identity.sub,
			email: identity.email,
			name: identity.name
		})
		.run();
	return id;
}