<script lang="ts">
	import { frequency, percent } from '#lib/format.js';
	import Graph from '#lib/graph/Graph.svelte';
	import { monitor } from '#lib/state/monitor.svelte.js';

	interface Props {
		count: number;
	}

	let { count }: Props = $props();

	let latest = $derived(monitor.latest);
	let cores = $derived(Array.from({ length: count }, (_, core) => ({ core, values: monitor.ticks.map((tick) => tick.cpu.cores[core] ?? null) })));
</script>

<div class="cores">
	{#each cores as { core, values } (core)}
		<div class="flex min-w-0 flex-col gap-1.5">
			<div class="flex items-baseline justify-between gap-2 px-1 text-[12px]">
				<span class="text-[var(--text-muted)]">Core {core + 1}</span>
				<span class="tabular-nums">
					{percent(latest?.cpu.cores[core] ?? null)}
					{#if latest?.cpu.frequencies}
						<span class="text-[var(--text-muted)]">· {frequency(latest.cpu.frequencies[core])}</span>
					{/if}
				</span>
			</div>
			<Graph class="core" lines={[{ values }]} max={100} compact />
		</div>
	{/each}
</div>

<style>
	.cores {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
		gap: 16px 14px;
	}

	.cores :global(.core) {
		height: 56px;
		border-radius: 12px;
		background: var(--surface);
	}
</style>
