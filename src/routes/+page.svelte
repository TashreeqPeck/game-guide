<script lang="ts">
	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold text-white">Your games</h1>
			<p class="mt-1 text-sm text-zinc-400">Track guide progress across playthroughs.</p>
		</div>
		<a
			href="/guides/import"
			class="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
		>
			Import guide
		</a>
	</div>

	{#if data.games.length === 0}
		<div class="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center">
			<p class="text-zinc-300">No guides yet.</p>
			<p class="mt-2 text-sm text-zinc-500">Upload a YAML guide file to get started.</p>
			<a
				href="/guides/import"
				class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white"
			>
				Import your first guide
			</a>
		</div>
	{:else}
		<ul class="space-y-3">
			{#each data.games as game (game.id)}
				<li>
					<a
						href={`/games/${game.slug}`}
						class="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<h2 class="text-lg font-semibold text-white">{game.title}</h2>
								<p class="mt-1 text-sm text-zinc-400">
									{game.guideCount} guide{game.guideCount === 1 ? '' : 's'} · {game.totalItems} checklist
									items
								</p>
							</div>
							<span class="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200">
								{game.latestPercent}%
							</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>