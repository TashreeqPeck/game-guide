<script lang="ts">
	import Self from './ChecklistTree.svelte';
	import type { ChecklistItem, ChecklistSection } from './checklist-types';

	let {
		sections,
		filterTag = '',
		hideCompleted = false,
		playthroughId
	}: {
		sections: ChecklistSection[];
		filterTag?: string;
		hideCompleted?: boolean;
		playthroughId: string;
	} = $props();

	function itemVisible(item: ChecklistItem): boolean {
		let visible = true;
		if (filterTag.length > 0 && !item.tags.includes(filterTag)) {
			visible = false;
		}
		if (hideCompleted && item.checked) {
			visible = false;
		}
		return visible;
	}

	function sectionHasVisibleItems(section: ChecklistSection): boolean {
		let has = false;
		section.items.forEach((item) => {
			if (itemVisible(item)) {
				has = true;
			}
		});
		section.children.forEach((child) => {
			if (sectionHasVisibleItems(child)) {
				has = true;
			}
		});
		return has;
	}
</script>

<ul class="space-y-3">
	{#each sections as section (section.id)}
		{#if sectionHasVisibleItems(section)}
			<li class="rounded-2xl border border-zinc-800 bg-zinc-900">
				<details class="group" open>
					<summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3">
						<span class="font-medium text-white">{section.title ?? section.id}</span>
						{#if section.total > 0}
							<span class="text-xs text-zinc-400"
								>{section.checked}/{section.total} ({Math.round((section.checked / section.total) * 100)}%)</span
							>
						{/if}
					</summary>
					<div class="space-y-3 border-t border-zinc-800 px-4 pb-4 pt-2">
						{#if section.bodyHtml}
							<div class="prose-guide">{@html section.bodyHtml}</div>
						{/if}
						<ul class="space-y-2">
							{#each section.items as item (item.id)}
								{#if itemVisible(item)}
									<li id={`item-${item.id}`}>
										<form method="POST" action="?/toggle" class="flex min-h-11 items-start gap-3 rounded-xl bg-zinc-950 p-3">
											<input type="hidden" name="itemId" value={item.id} />
											<input type="hidden" name="checked" value={item.checked ? '0' : '1'} />
											<button
												type="submit"
												aria-pressed={item.checked}
												class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-600 {item.checked
													? 'bg-blue-600 text-white'
													: 'bg-zinc-900 text-transparent'}"
											>
												✓
											</button>
											<div class="min-w-0 flex-1">
												<p class={item.checked ? 'text-zinc-500 line-through' : 'text-zinc-100'}>{item.text}</p>
												{#if item.notesHtml}
													<div class="prose-guide mt-1 text-sm">{@html item.notesHtml}</div>
												{/if}
												{#if item.tags.length > 0}
													<div class="mt-2 flex flex-wrap gap-1">
														{#each item.tags as tag (tag)}
															<span class="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{tag}</span>
														{/each}
													</div>
												{/if}
											</div>
										</form>
									</li>
								{/if}
							{/each}
						</ul>
						{#if section.children.length > 0}
							<Self sections={section.children} {filterTag} {hideCompleted} {playthroughId} />
						{/if}
					</div>
				</details>
			</li>
		{/if}
	{/each}
</ul>