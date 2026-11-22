export function playthroughListQuery(filterTag: string, hideCompleted: boolean): string {
	const params = new URLSearchParams();
	if (filterTag.length > 0) {
		params.set('tag', filterTag);
	}
	if (hideCompleted) {
		params.set('hideCompleted', '1');
	}
	const qs = params.toString();
	if (qs.length > 0) {
		return `?${qs}`;
	}
	return '';
}