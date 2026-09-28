<script lang="ts">
	import { onMount } from 'svelte';
	import { isAvailable } from '@lantharos/sabine';
	import { GlassShell, WindowControls } from '@luft/ui';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { PANELS } from '$lib/panels/registry';
	import { app } from '$lib/state/app.svelte';

	let panel = $derived(PANELS.find((entry) => entry.id === app.panel)!);
	let scroller = $state<HTMLDivElement>();

	onMount(() => {
		if (isAvailable()) void app.start();
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
			<h1 class="truncate text-[20px] font-semibold">{panel.title}</h1>
			<WindowControls />
		</header>
		<div bind:this={scroller} class="soft-scroll min-h-0 flex-1 overflow-y-auto">
			<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
				{#await panel.load() then module}
					<module.default />
				{/await}
			</div>
		</div>
	</main>
</GlassShell>
