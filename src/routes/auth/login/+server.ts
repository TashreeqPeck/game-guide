import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildAuthorizationUrl } from '$lib/server/auth/oidc';
import { redirectOrLocation } from '$lib/server/http-redirect';
import { createAuthState, createPkcePair } from '$lib/server/auth/pkce';
import { createSession, getSessionCookieName } from '$lib/server/auth/session';
import { upsertUser } from '$lib/server/auth/users';
import { getEnv } from '$lib/server/env';

const OIDC_VERIFIER_COOKIE = 'gg_oidc_verifier';
const OIDC_STATE_COOKIE = 'gg_oidc_state';
const OIDC_NONCE_COOKIE = 'gg_oidc_nonce';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const env = getEnv();
	const returnTo = url.searchParams.get('returnTo') ?? '/';

	if (env.authMode === 'dev') {
		const userId = upsertUser({
			issuer: 'dev://localhost',
			sub: env.devUserEmail,
			email: env.devUserEmail,
			name: 'Dev User'
		});
		const session = createSession(userId);
		cookies.set(getSessionCookieName(), session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			expires: session.expiresAt
		});
		throw redirect(303, returnTo);
	} else {
		const { verifier, challenge } = createPkcePair();
		const { state, nonce } = createAuthState();
		const redirectUri = `${env.origin}/auth/callback`;
		const authUrl = await buildAuthorizationUrl(redirectUri, challenge, state, nonce);
		cookies.set(OIDC_VERIFIER_COOKIE, verifier, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			maxAge: 600
		});
		cookies.set(OIDC_STATE_COOKIE, state, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			maxAge: 600
		});
		cookies.set(OIDC_NONCE_COOKIE, nonce, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			maxAge: 600
		});
		cookies.set('gg_return_to', returnTo, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: env.nodeEnv === 'production',
			maxAge: 600
		});
		return redirectOrLocation(302, authUrl.toString());
	}
};