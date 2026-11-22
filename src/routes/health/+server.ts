import { json } from '@sveltejs/kit';
import { getEnv } from '$lib/server/env';

export function GET() {
	const env = getEnv();
	return json({
		ok: true,
		version: env.appVersion
	});
}