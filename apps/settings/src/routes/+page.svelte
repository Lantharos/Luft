<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import { appearance, GlassShell, WindowControls } from '@luft/ui';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { isShown, PANELS, titleOf } from '$lib/panels/registry';
	import { app } from '$lib/state/app.svelte';
	import { hardware } from '$lib/state/hardware.svelte';

	let panel = $derived(PANELS.find((entry) => entry.id === app.panel)!);
	let present = $derived(hardware.present);
	let scroller = $state<HTMLDivElement>();

	onMount(() => {
		if (isAvailable()) void app.start();
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	$effect(() => {
		void app.panel;
		scroller?.scrollTo({ top: 0 });
	});
</script>

<GlassShell>
	<Sidebar />
	<main class="glass-content">
		<header class="drag-region flex h-[60px] flex-none items-center justify-between gap-4 pr-4 pl-8">
			<h1 class="truncate text-[20px] font-semibold">{present ? titleOf(panel, present) : ''}</h1>
			<WindowControls />
		</header>
		<div bind:this={scroller} class="soft-scroll min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
				{#if present && isShown(panel, present)}
					{#await panel.load() then module}
						<module.default />
					{/await}
				{:else if present && panel.needs}
					<p class="px-1.5 text-[14px] text-[var(--text-muted)]">{panel.needs.missing}</p>
				{/if}
			</div>
		</div>
	</main>
</GlassShell>
