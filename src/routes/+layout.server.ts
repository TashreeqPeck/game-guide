import type { LayoutServerLoad } from './$types';
import { getEnv } from '$lib/server/env';

export const load: LayoutServerLoad = async ({ locals }) => {
	const env = getEnv();
	return {
		user: locals.user,
		appVersion: env.appVersion
	};
};