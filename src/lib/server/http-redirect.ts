import { redirect } from '@sveltejs/kit';

type RedirectStatus = 300 | 301 | 302 | 303 | 307 | 308;

function isAbsoluteHttpUrl(location: string): boolean {
	return location.startsWith('http://') || location.startsWith('https://');
}

/** Kit `redirect()` only allows same-origin paths; OAuth/OIDC needs an HTTP Location response. */
export function redirectOrLocation(status: RedirectStatus, location: string): Response {
	let response: Response;
	if (isAbsoluteHttpUrl(location)) {
		response = new Response(null, {
			status,
			headers: { Location: location }
		});
	} else {
		throw redirect(status, location);
	}
	return response;
}