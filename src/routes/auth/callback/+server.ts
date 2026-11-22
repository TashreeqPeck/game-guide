import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCode } from '$lib/server/auth/oidc';
import { createSession, getSessionCookieName } from '$lib/server/auth/session';
import { upsertUser } from '$lib/server/auth/users';
import { getEnv } from '$lib/server/env';

const OIDC_VERIFIER_COOKIE = 'gg_oidc_verifier';
const OIDC_STATE_COOKIE = 'gg_oidc_state';
const OIDC_NONCE_COOKIE = 'gg_oidc_nonce';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const env = getEnv();
	if (env.authMode === 'dev') {
		throw redirect(303, '/');
	}

	const verifier = cookies.get(OIDC_VERIFIER_COOKIE);
	const expectedState = cookies.get(OIDC_STATE_COOKIE);
	const expectedNonce = cookies.get(OIDC_NONCE_COOKIE);
	const returnTo = cookies.get('gg_return_to') ?? '/';
	const receivedState = url.searchParams.get('state') ?? '';

	if (verifier === undefined || expectedState === undefined || expectedNonce === undefined) {
		error(400, 'Missing OIDC session cookies');
	} else {
		const claims = await exchangeCode(url, verifier, expectedState, receivedState, expectedNonce);
		const issuer = claims.iss ?? env.oidcIssuer;
		const email = claims.email ?? `${claims.sub}@oidc.local`;
		const name = claims.name ?? email;
		const userId = upsertUser({
			issuer,
			sub: claims.sub,
			email,
			name
		});
		const session = createSession(userId);
		cookies.delete(OIDC_VERIFIER_COOKIE, { path: '/' });
		cookies.delete(OIDC_STATE_COOKIE, { path: '/' });
		cookies.delete(OIDC_NONCE_COOKIE, { path: '/' });
		cookies.delete('gg_return_to', { path: '/' });
		cookies.set(getSessionCookieName(), session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			expires: session.expiresAt
		});
		throw redirect(303, returnTo);
	}
};