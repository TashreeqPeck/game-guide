import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const body = JSON.stringify({
		name: 'Game Guide Tracker',
		short_name: 'Guides',
		start_url: '/',
		display: 'standalone',
		background_color: '#09090b',
		theme_color: '#09090b',
		icons: [
			{
				src: '/icons/icon-192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/icons/icon-512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	});
	return new Response(body, {
		headers: {
			'Content-Type': 'application/manifest+json'
		}
	});
};