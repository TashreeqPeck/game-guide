<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
	<meta name="theme-color" content="#09090b" />
	<title>Game Guide Tracker</title>
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur">
		<div class="mx-auto flex max-w-3xl items-center justify-between gap-3">
			<a href="/" class="text-lg font-semibold tracking-tight text-white">Game Guide Tracker</a>
			{#if data.user}
				<div class="flex items-center gap-2 text-sm text-zinc-400">
					<span class="hidden sm:inline">{data.user.name}</span>
					<a
						href="/auth/logout"
						class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-zinc-200 hover:bg-zinc-800"
					>
						Log out
					</a>
				</div>
			{/if}
		</div>
	</header>
	<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
		{@render children()}
	</main>
	<footer class="border-t border-zinc-900 px-4 py-4 text-center text-xs text-zinc-500">
		v{data.appVersion}
	</footer>
</div>