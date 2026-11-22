<script lang="ts">
	import Self from './SectionTree.svelte';
	import type { SectionNode } from './section-types';

	let { sections }: { sections: SectionNode[] } = $props();
</script>

<ul class="space-y-3">
	{#each sections as section (section.id)}
		<li class="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
			{#if section.title}
				<h3 class="font-medium text-white">{section.title}</h3>
			{/if}
			{#if section.bodyHtml}
				<div class="prose-guide mt-2">{@html section.bodyHtml}</div>
			{/if}
			{#if section.children.length > 0}
				<div class="mt-3 pl-2">
					<Self sections={section.children} />
				</div>
			{/if}
		</li>
	{/each}
</ul>