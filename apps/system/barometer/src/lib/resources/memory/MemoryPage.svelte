<script lang="ts">
	import { t } from '@luft/i18n';
	import { memoryBytes } from '@luft/ui';
	import type { MemorySample } from '#lib/bindings.js';
	import { fixed, percent, share } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Meter from '#lib/resources/common/Meter.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { monitor } from '#lib/state/monitor.svelte.js';

	let memory = $derived(monitor.latest?.memory);
	let used = $derived(memory ? memory.total - memory.available : 0);
	let swapUsed = $derived(memory ? memory.swapTotal - memory.swapFree : 0);
	let total = $derived(memory ? memoryBytes(memory.total) : null);
	let installed = $derived(total ? t('barometer-memory-installed', { size: total }) : null);
	let ofTotal = $derived(total ? t('barometer-of', { total }) : undefined);
	let label = $derived({
		inUse: t('barometer-memory-in-use'),
		now: t('barometer-now'),
		cache: t('barometer-memory-cache'),
		free: t('barometer-free'),
		available: t('barometer-memory-available'),
		apps: t('barometer-memory-apps'),
		appsDetail: t('barometer-memory-apps-detail'),
		cached: t('barometer-memory-cached'),
		shared: t('barometer-memory-shared'),
		kernel: t('barometer-memory-kernel'),
		dirty: t('barometer-memory-dirty'),
		committed: t('barometer-memory-committed'),
		committedDetail: t('barometer-memory-committed-detail'),
		swapKinds: {
			compressed: t('barometer-swap-kind-compressed'),
			partition: t('barometer-swap-kind-partition'),
			file: t('barometer-swap-kind-file')
		} as Record<string, string>,
		swappedIn: t('barometer-swap-cached'),
		compressed: t('barometer-swap-compressed'),
		ratio: t('barometer-swap-ratio')
	});

	const inUse = (sample: MemorySample) => sample.total - sample.available;
</script>

<Page title={t('barometer-memory-title')} detail={installed}>
	<Chart
		title={label.inUse}
		tall
		max={memory?.total ?? 1}
		lines={[{ values: monitor.ticks.map((tick) => inUse(tick.memory)) }]}
		legend={[{ label: label.now, value: memory ? `${memoryBytes(used)} (${percent(share(used, memory.total))})` : '–' }]}
		scale={(max) => memoryBytes(max)}
	/>

	{#if memory}
		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-memory-composition')}</h2>
			<Meter
				label={t('barometer-memory-composition-label')}
				total={memory.total}
				segments={[
					{ label: label.inUse, value: used, display: memoryBytes(used), tone: 'accent' },
					{ label: label.cache, value: memory.available - memory.free, display: memoryBytes(memory.available - memory.free), tone: 'soft' },
					{ label: label.free, value: memory.free, display: memoryBytes(memory.free), tone: 'empty' }
				]}
			/>
		</section>

		<Stats
			stats={[
				{ label: label.inUse, value: memoryBytes(used), detail: ofTotal },
				{ label: label.available, value: memoryBytes(memory.available) },
				{ label: label.apps, value: memoryBytes(memory.anon), detail: label.appsDetail },
				{ label: label.cached, value: memoryBytes(memory.cached + memory.buffers) },
				{ label: label.shared, value: memoryBytes(memory.shared) },
				{ label: label.kernel, value: memoryBytes(memory.kernel) },
				{ label: label.dirty, value: memoryBytes(memory.dirty) },
				{ label: label.committed, value: memoryBytes(memory.committed), detail: label.committedDetail }
			]}
		/>

		{#if memory.swapTotal > 0}
			<Chart
				title={t('barometer-swap')}
				max={memory.swapTotal}
				lines={[{ values: monitor.ticks.map((tick) => tick.memory.swapTotal - tick.memory.swapFree), tone: 'soft' }]}
				legend={[{ label: label.now, value: t('barometer-used-of', { used: memoryBytes(swapUsed), total: memoryBytes(memory.swapTotal) }), tone: 'soft' }]}
				scale={(max) => memoryBytes(max)}
			/>
		{/if}

		<Facts
			title={t('barometer-swap-title')}
			facts={[
				...(memory.swaps ?? []).map((swap) => ({
					label: `${swap.name} · ${label.swapKinds[swap.kind] ?? swap.kind}`,
					value: t('barometer-used-of', { used: memoryBytes(swap.used), total: memoryBytes(swap.size) })
				})),
				{ label: label.swappedIn, value: memory.swapCached ? memoryBytes(memory.swapCached) : null },
				{
					label: label.compressed,
					value: memory.compressed ? t('barometer-swap-compressed-value', { stored: memoryBytes(memory.compressed.stored), size: memoryBytes(memory.compressed.size) }) : null
				},
				{
					label: label.ratio,
					value: memory.compressed && memory.compressed.size ? `${fixed(memory.compressed.stored / memory.compressed.size, 1)}×` : null
				}
			]}
		/>
	{/if}
</Page>
