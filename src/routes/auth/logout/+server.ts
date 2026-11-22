import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildLogoutUrl } from '$lib/server/auth/oidc';
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

	throw redirect(303, target);
};