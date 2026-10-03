<script lang="ts">
	import { memoryBytes } from '@luft/ui';
	import type { MemorySample } from '#lib/backend/types.js';
	import { percent, share } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Meter from '#lib/resources/common/Meter.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { monitor } from '#lib/state/monitor.svelte.js';

	const SWAP_KINDS: Record<string, string> = { compressed: 'Compressed in memory', partition: 'Partition', file: 'File' };

	let memory = $derived(monitor.latest?.memory);
	let used = $derived(memory ? memory.total - memory.available : 0);
	let swapUsed = $derived(memory ? memory.swapTotal - memory.swapFree : 0);

	const inUse = (sample: MemorySample) => sample.total - sample.available;
</script>

<Page title="Memory" detail={memory ? `${memoryBytes(memory.total)} installed` : null}>
	<Chart
		title="In use"
		tall
		max={memory?.total ?? 1}
		lines={[{ values: monitor.ticks.map((tick) => inUse(tick.memory)) }]}
		legend={[{ label: 'Now', value: memory ? `${memoryBytes(used)} (${percent(share(used, memory.total))})` : '–' }]}
		scale={(max) => memoryBytes(max)}
	/>

	{#if memory}
		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-[13px] font-medium text-[var(--text-soft)]">Composition</h2>
			<Meter
				label="Memory composition"
				total={memory.total}
				segments={[
					{ label: 'In use', value: used, display: memoryBytes(used), tone: 'accent' },
					{ label: 'Cache', value: memory.available - memory.free, display: memoryBytes(memory.available - memory.free), tone: 'soft' },
					{ label: 'Free', value: memory.free, display: memoryBytes(memory.free), tone: 'empty' }
				]}
			/>
		</section>

		<Stats
			stats={[
				{ label: 'In use', value: memoryBytes(used), detail: `of ${memoryBytes(memory.total)}` },
				{ label: 'Available', value: memoryBytes(memory.available) },
				{ label: 'Apps', value: memoryBytes(memory.anon), detail: 'Private memory of programs' },
				{ label: 'Cached files', value: memoryBytes(memory.cached + memory.buffers) },
				{ label: 'Shared', value: memoryBytes(memory.shared) },
				{ label: 'Kernel', value: memoryBytes(memory.kernel) },
				{ label: 'Waiting to be written', value: memoryBytes(memory.dirty) },
				{ label: 'Committed', value: memoryBytes(memory.committed), detail: 'Promised to programs' }
			]}
		/>

		{#if memory.swapTotal > 0}
			<Chart
				title="Swap"
				max={memory.swapTotal}
				lines={[{ values: monitor.ticks.map((tick) => tick.memory.swapTotal - tick.memory.swapFree), tone: 'soft' }]}
				legend={[{ label: 'Now', value: `${memoryBytes(swapUsed)} of ${memoryBytes(memory.swapTotal)}`, tone: 'soft' }]}
				scale={(max) => memoryBytes(max)}
			/>
		{/if}

		<Facts
			title="Swap and compression"
			facts={[
				...(memory.swaps ?? []).map((swap) => ({ label: `${swap.name} · ${SWAP_KINDS[swap.kind] ?? swap.kind}`, value: `${memoryBytes(swap.used)} of ${memoryBytes(swap.size)}` })),
				{ label: 'Swapped back in', value: memory.swapCached ? memoryBytes(memory.swapCached) : null },
				{
					label: 'Compressed',
					value: memory.compressed ? `${memoryBytes(memory.compressed.stored)} stored in ${memoryBytes(memory.compressed.size)}` : null
				},
				{
					label: 'Compression ratio',
					value: memory.compressed && memory.compressed.size ? `${(memory.compressed.stored / memory.compressed.size).toFixed(1)}×` : null
				}
			]}
		/>
	{/if}
</Page>
