<script lang="ts">
	let { data, form } = $props();
</script>

<div class="space-y-6">
	<div>
		<p class="text-sm text-zinc-500">
			<a href={`/play/${data.playthrough.id}`} class="hover:text-zinc-300">Back to checklist</a>
		</p>
		<h1 class="text-2xl font-bold text-white">History</h1>
		<p class="mt-1 text-sm text-zinc-400">{data.guide.title} · {data.playthrough.name}</p>
	</div>

	<form method="POST" action="?/undo">
		<button
			type="submit"
			class="inline-flex min-h-11 items-center rounded-xl border border-zinc-700 px-4 text-sm text-zinc-200 hover:bg-zinc-900"
		>
			Undo last change
		</button>
	</form>
	{#if form?.message}
		<p class="text-sm text-red-400">{form.message}</p>
	{/if}

	<ul class="space-y-2">
		{#each data.events as event (event.id)}
			<li class="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm">
				<p class="text-zinc-200">
					<span class={event.action === 'check' ? 'text-green-400' : 'text-amber-400'}>{event.action}</span>
					· {event.itemText}
				</p>
				<p class="mt-1 text-xs text-zinc-500">{event.at.toISOString()}</p>
			</li>
		{/each}
	</ul>
</div>