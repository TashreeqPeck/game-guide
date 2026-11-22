import * as client from 'openid-client';
import { getEnv } from '../env';

let configPromise: Promise<client.Configuration> | null = null;

async function getOidcConfig(): Promise<client.Configuration> {
	if (configPromise === null) {
		const env = getEnv();
		configPromise = client.discovery(new URL(env.oidcIssuer), env.oidcClientId, env.oidcClientSecret);
	}
	return configPromise;
}

export async function buildAuthorizationUrl(
	redirectUri: string,
	codeChallenge: string,
	state: string,
	nonce: string
): Promise<URL> {
	const env = getEnv();
	const configuration = await getOidcConfig();
	const scopes = env.oidcScopes.split(/\s+/).filter((s) => s.length > 0);
	return client.buildAuthorizationUrl(configuration, {
		redirect_uri: redirectUri,
		scope: scopes.join(' '),
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
		state,
		nonce
	});
}

export type IdTokenClaims = {
	sub: string;
	email?: string;
	name?: string;
	nonce?: string;
	iss?: string;
};

export async function exchangeCode(
	callbackUrl: URL,
	codeVerifier: string,
	expectedState: string,
	receivedState: string,
	expectedNonce: string
): Promise<IdTokenClaims> {
	let result: IdTokenClaims;
	if (expectedState !== receivedState) {
		throw new Error('Invalid OIDC state');
	} else {
		const configuration = await getOidcConfig();
		const tokens = await client.authorizationCodeGrant(configuration, callbackUrl, {
			pkceCodeVerifier: codeVerifier,
			expectedState,
			expectedNonce
		});
		const idClaims = tokens.claims() as IdTokenClaims | undefined;
		if (idClaims === undefined) {
			throw new Error('Missing ID token claims');
		} else {
			result = idClaims;
		}
	}
	return result;
}

export async function buildLogoutUrl(idTokenHint: string | undefined): Promise<string | null> {
	const configuration = await getOidcConfig();
	const metadata = configuration.serverMetadata();
	if (metadata.end_session_endpoint === undefined) {
		return null;
	}
	const url = new URL(metadata.end_session_endpoint);
	if (idTokenHint !== undefined) {
		url.searchParams.set('id_token_hint', idTokenHint);
	}
	return url.toString();
}