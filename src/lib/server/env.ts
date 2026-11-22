export type AuthMode = 'oidc' | 'dev';

export type AppEnv = {
	authMode: AuthMode;
	devUserEmail: string;
	databasePath: string;
	origin: string;
	oidcIssuer: string;
	oidcClientId: string;
	oidcClientSecret: string;
	oidcScopes: string;
	sessionTtlDays: number;
	maxUploadBytes: number;
	appVersion: string;
	nodeEnv: string;
	bodySizeLimit: number;
};

function readAuthMode(): AuthMode {
	const raw = (process.env.AUTH_MODE ?? 'dev').toLowerCase();
	if (raw === 'oidc') {
		return 'oidc';
	}
	if (raw === 'dev') {
		return 'dev';
	}
	throw new Error(`Invalid AUTH_MODE: ${raw}`);
}

function assertDevNotInProduction(authMode: AuthMode, nodeEnv: string): void {
	if (authMode === 'dev' && nodeEnv === 'production') {
		throw new Error('AUTH_MODE=dev is not allowed when NODE_ENV=production');
	}
}

export function loadEnv(): AppEnv {
	const nodeEnv = process.env.NODE_ENV ?? 'development';
	const authMode = readAuthMode();
	assertDevNotInProduction(authMode, nodeEnv);

	const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES ?? 2_097_152);
	const sessionTtlDays = Number(process.env.SESSION_TTL_DAYS ?? 30);

	return {
		authMode,
		devUserEmail: process.env.DEV_USER_EMAIL ?? 'dev@localhost',
		databasePath: process.env.DATABASE_PATH ?? './data/app.db',
		origin: process.env.ORIGIN ?? 'http://localhost:5173',
		oidcIssuer: process.env.OIDC_ISSUER ?? '',
		oidcClientId: process.env.OIDC_CLIENT_ID ?? '',
		oidcClientSecret: process.env.OIDC_CLIENT_SECRET ?? '',
		oidcScopes: process.env.OIDC_SCOPES ?? 'openid profile email',
		sessionTtlDays,
		maxUploadBytes,
		appVersion: process.env.APP_VERSION ?? '0.0.0-dev',
		nodeEnv,
		bodySizeLimit: maxUploadBytes
	};
}

let cached: AppEnv | null = null;

export function resetEnvCache(): void {
	cached = null;
}

export function getEnv(): AppEnv {
	if (cached === null) {
		cached = loadEnv();
	}
	return cached;
}