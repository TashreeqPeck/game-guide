import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { FORMAT_REFERENCE_YAML, FORMAT_RULES } from '$lib/server/guides/format-reference';
import { importGuide } from '$lib/server/guides/import';
import { getEnv } from '$lib/server/env';

export const load: PageServerLoad = async () => {
	return {
		formatYaml: FORMAT_REFERENCE_YAML,
		formatRules: FORMAT_RULES
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id;
		if (userId === undefined) {
			return fail(401, { results: [] });
		}

		const env = getEnv();
		const form = await request.formData();
		const files = form.getAll('files').filter((entry): entry is File => entry instanceof File);
		const results: Array<
			| { fileName: string; ok: true; guideId: string; added: number; updated: number; retired: number }
			| { fileName: string; ok: false; errors: string[] }
		> = [];

		for (const file of files) {
			if (file.size > env.maxUploadBytes) {
				results.push({
					fileName: file.name,
					ok: false,
					errors: [`file exceeds max size of ${env.maxUploadBytes} bytes`]
				});
			} else {
				const yamlText = await file.text();
				const outcome = importGuide(userId, yamlText);
				if (outcome.ok) {
					results.push({
						fileName: file.name,
						ok: true,
						guideId: outcome.guideId,
						added: outcome.added,
						updated: outcome.updated,
						retired: outcome.retired
					});
				} else {
					results.push({ fileName: file.name, ok: false, errors: outcome.errors });
				}
			}
		}

		return { results };
	}
};