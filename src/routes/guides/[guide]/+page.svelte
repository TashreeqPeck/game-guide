<script lang="ts">
	import SectionTree from '$lib/components/SectionTree.svelte';

	let { data, form } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-white">{data.guide.title}</h1>
		{#if data.guide.author}
			<p class="mt-1 text-sm text-zinc-400">By {data.guide.author}</p>
		{/if}
		{#if data.guide.source}
			<p class="mt-1 text-sm">
				<a href={data.guide.source} class="text-blue-400 hover:underline" rel="noreferrer" target="_blank"
					>Source guide</a
				>
			</p>
		{/if}
		<p class="mt-2 text-sm text-zinc-500">{data.itemCount} checklist items</p>
	</div>

	<form method="POST" action="?/createPlaythrough" class="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
		<h2 class="text-lg font-semibold text-white">New playthrough</h2>
		{#if form?.message}
			<p class="mt-2 text-sm text-red-400">{form.message}</p>
		{/if}
		<div class="mt-3 space-y-3">
			<input
				name="name"
				type="text"
				required
				placeholder="Playthrough name"
				class="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-white"
			/>
			<button
				type="submit"
				class="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-medium text-white"
			>
				Start tracking
			</button>
		</div>
	</form>

	{#if data.playthroughs.length > 0}
		<div>
			<h2 class="text-lg font-semibold text-white">Your playthroughs</h2>
			<ul class="mt-3 space-y-2">
				{#each data.playthroughs as pt (pt.id)}
					<li>
						<a
							href={`/play/${pt.id}`}
							class="flex min-h-11 items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 hover:bg-zinc-900"
						>
							<span>{pt.name}</span>
							<span class="text-sm text-zinc-500">Resume</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div>
		<h2 class="text-lg font-semibold text-white">Reference</h2>
		<div class="mt-3">
			<SectionTree sections={data.sectionTree} />
		</div>
	</div>
</div>