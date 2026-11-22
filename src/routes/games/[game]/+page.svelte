<script lang="ts">
	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<p class="text-sm text-zinc-500"><a href="/" class="hover:text-zinc-300">Games</a></p>
			<h1 class="text-2xl font-bold text-white">{data.game.title}</h1>
		</div>
		<a
			href="/guides/import"
			class="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 px-4 text-sm text-zinc-100 hover:bg-zinc-900"
		>
			Import guide
		</a>
	</div>

	<ul class="space-y-4">
		{#each data.guides as guide (guide.id)}
			<li class="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-white">
							<a href={`/guides/${guide.id}`} class="hover:underline">{guide.title}</a>
						</h2>
						{#if guide.author}
							<p class="mt-1 text-sm text-zinc-400">By {guide.author}</p>
						{/if}
					</div>
				</div>
				{#if guide.playthroughs.length > 0}
					<ul class="mt-4 space-y-2">
						{#each guide.playthroughs as pt (pt.id)}
							<li>
								<a
									href={`/play/${pt.id}`}
									class="flex min-h-11 items-center justify-between rounded-xl bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-800"
								>
									<span>{pt.name}</span>
									<span class="text-zinc-400">{pt.percent}%</span>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-3 text-sm text-zinc-500">No playthroughs yet.</p>
				{/if}
			</li>
		{/each}
	</ul>
</div>