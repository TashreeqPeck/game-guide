<script lang="ts">
	let { data, form } = $props();
	let showReference = $state(false);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-white">Import guide</h1>
		<p class="mt-1 text-sm text-zinc-400">Upload one or more YAML files. Each file becomes one guide.</p>
	</div>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
	>
		<label class="block text-sm font-medium text-zinc-200" for="files">YAML files</label>
		<input
			id="files"
			name="files"
			type="file"
			accept=".yaml,.yml"
			multiple
			class="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-100"
		/>
		<button
			type="submit"
			class="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
		>
			Upload
		</button>
	</form>

	{#if form?.results}
		<div class="space-y-3">
			{#each form.results as result (result.fileName)}
				<div class="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
					<p class="font-medium text-white">{result.fileName}</p>
					{#if result.ok}
						<p class="mt-1 text-sm text-green-400">
							Imported · added {result.added}, updated {result.updated}, retired {result.retired}
						</p>
						<a href={`/guides/${result.guideId}`} class="mt-2 inline-block text-sm text-blue-400 hover:underline">
							Open guide
						</a>
					{:else}
						<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-300">
							{#each result.errors as err (err)}
								<li>{err}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<div class="rounded-2xl border border-zinc-800 bg-zinc-900">
		<button
			type="button"
			class="flex min-h-11 w-full items-center justify-between px-4 text-left text-sm font-medium text-zinc-200"
			onclick={() => (showReference = !showReference)}
		>
			Format reference
			<span>{showReference ? '−' : '+'}</span>
		</button>
		{#if showReference}
			<div class="space-y-3 border-t border-zinc-800 p-4">
				<ul class="list-disc space-y-1 pl-5 text-sm text-zinc-400">
					{#each data.formatRules as rule (rule)}
						<li>{rule}</li>
					{/each}
				</ul>
				<pre class="overflow-x-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-300"><code
						>{data.formatYaml}</code
					></pre>
			</div>
		{/if}
	</div>
</div>