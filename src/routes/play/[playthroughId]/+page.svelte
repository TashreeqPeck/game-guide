<script lang="ts">
	import ChecklistTree from '$lib/components/ChecklistTree.svelte';
	import { playthroughListQuery } from '$lib/playthrough-query';

	let { data } = $props();

	let tagsExpanded = $state(false);

	const activeTagLabel = $derived(
		data.filterTag.length > 0 ? data.filterTag : 'All tags'
	);

	function buildQuery(tag: string, hideCompleted: boolean) {
		const qs = playthroughListQuery(tag, hideCompleted);
		if (qs.length > 0) {
			return qs;
		}
		return '?';
	}
</script>

<div class="space-y-4 pb-24">
	<div>
		<p class="text-sm text-zinc-500">
			<a href={`/guides/${data.guide.id}`} class="hover:text-zinc-300">{data.guide.title}</a>
		</p>
		<h1 class="text-2xl font-bold text-white">{data.playthrough.name}</h1>
	</div>

	<div
		class="sticky top-[57px] z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur"
	>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="text-sm text-zinc-300">
				{data.stats.checked}/{data.stats.total} complete ({data.stats.percent}%)
			</p>
			{#if data.firstUncheckedId}
				<a
					href={`#item-${data.firstUncheckedId}`}
					class="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-3 text-sm text-white"
				>
					Next unchecked
				</a>
			{/if}
		</div>
		<div class="mt-3 flex flex-wrap items-center gap-2">
			<button
				type="button"
				class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 md:hidden"
				aria-expanded={tagsExpanded}
				onclick={() => {
					tagsExpanded = !tagsExpanded;
				}}
			>
				Tags: {activeTagLabel}
				<span class="text-xs text-zinc-500" aria-hidden="true">{tagsExpanded ? '▲' : '▼'}</span>
			</button>
			<a
				href={buildQuery(data.filterTag, !data.hideCompleted)}
				class="min-h-11 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
			>
				{data.hideCompleted ? 'Show completed' : 'Hide completed'}
			</a>
			<a
				href={`/play/${data.playthrough.id}/history`}
				class="min-h-11 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
			>
				History
			</a>
		</div>
		<div
			class="mt-2 flex flex-wrap gap-2 {tagsExpanded ? 'flex' : 'hidden'} md:mt-3 md:flex"
		>
			<a
				href={buildQuery('', data.hideCompleted)}
				class="min-h-11 rounded-xl px-3 py-2 text-sm {data.filterTag === ''
					? 'bg-zinc-800 text-white'
					: 'text-zinc-400 hover:bg-zinc-900'}"
			>
				All tags
			</a>
			{#each data.allTags as tag (tag)}
				<a
					href={buildQuery(tag, data.hideCompleted)}
					class="min-h-11 rounded-xl px-3 py-2 text-sm {data.filterTag === tag
						? 'bg-zinc-800 text-white'
						: 'text-zinc-400 hover:bg-zinc-900'}"
				>
					{tag}
				</a>
			{/each}
		</div>
	</div>

	<ChecklistTree
		sections={data.checklist}
		filterTag={data.filterTag}
		hideCompleted={data.hideCompleted}
		playthroughId={data.playthrough.id}
	/>
</div>