export function buildToggleAction(filterTag: string, hideCompleted: boolean): string {
	const params = new URLSearchParams();
	if (filterTag.length > 0) {
		params.set('tag', filterTag);
	}
	if (hideCompleted) {
		params.set('hideCompleted', '1');
	}
	const query = params.toString();
	return `?/toggle${query.length > 0 ? `&${query}` : ''}`;
}
