import type { Handle } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { getSessionCookieName, resolveSessionUser } from '$lib/server/auth/session';
import { migrate } from '$lib/server/db/migrate';
import { getEnv } from '$lib/server/env';

let migrated = false;

function ensureMigrated(): void {
	if (!migrated) {
		getEnv();
		migrate();
		migrated = true;
	}
}

function isPublicPath(pathname: string): boolean {
	let allowed = false;
	if (pathname.startsWith('/auth/')) {
		allowed = true;
	} else if (pathname === '/health') {
		allowed = true;
	} else if (pathname.startsWith('/manifest.webmanifest') || pathname.startsWith('/icons/')) {
		allowed = true;
	}
	return allowed;
}

export const handle: Handle = async ({ event, resolve }) => {
	ensureMigrated();

	const cookieName = getSessionCookieName();
	const token = event.cookies.get(cookieName);
	const user = resolveSessionUser(token);
	event.locals.user = user;

	if (user === null && !isPublicPath(event.url.pathname)) {
		const login = `/auth/login?returnTo=${encodeURIComponent(event.url.pathname + event.url.search)}`;
		throw redirect(303, login);
	}

	return resolve(event);
};