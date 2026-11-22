import type { RequestHandler } from './$types';
import { buildLogoutUrl } from '$lib/server/auth/oidc';
import { redirectOrLocation } from '$lib/server/http-redirect';
import { deleteSessionByToken, getSessionCookieName } from '$lib/server/auth/session';
import { getEnv } from '$lib/server/env';

export const GET: RequestHandler = async ({ cookies }) => {
	const env = getEnv();
	const token = cookies.get(getSessionCookieName());
	if (token !== undefined) {
		deleteSessionByToken(token);
	}
	cookies.delete(getSessionCookieName(), { path: '/' });

	let target = '/auth/login';
	if (env.authMode === 'oidc') {
		const logoutUrl = await buildLogoutUrl(undefined);
		if (logoutUrl !== null) {
			target = logoutUrl;
		}
	}

	return redirectOrLocation(303, target);
};