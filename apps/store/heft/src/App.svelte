<script lang="ts">
	import { onMount } from 'svelte';
	import { i18n, t } from '@luft/i18n';
	import { appearance, errorText, GlassShell } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { session } from '#lib/app/session.svelte.js';
	import { settings } from '#lib/app/settings.svelte.js';
	import { appState } from '#lib/app/state.js';
	import { pen } from '#lib/input/pen.svelte.js';
	import { library } from '#lib/library/library.svelte.js';
	import Workspace from '#lib/shell/Workspace.svelte';
	import { tools } from '#lib/tools/tools.svelte.js';

	let failure: string | null = $state(null);

	onMount(() => {
		const stop = pen.start();
		start().catch((error) => (failure = errorText(error)));
		return stop;
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function start() {
		const state = await commands.appState();
		appearance.start(state);
		await Promise.all([i18n.ready, settings.load(), appState.load(), library.load()]);
		tools.load();
		await session.start();
	}
</script>

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full">
		{#if session.notebook}
			{#key session.notebook}
				<Workspace notebook={session.notebook} />
			{/key}
		{:else if failure}
			<main class="glass-content drag-region grid place-items-center p-8 text-center">
				<div class="max-w-[420px]">
					<h1 class="text-[17px] font-semibold">{t('start-failed-title')}</h1>
					<p class="mt-2 text-[13px] text-(--text-soft)">{t('start-failed-body', { error: failure })}</p>
				</div>
			</main>
		{:else}
			<main class="glass-content drag-region"></main>
		{/if}
	</GlassShell>
</div>
