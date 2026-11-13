<script lang="ts">
	import { Section, Segmented } from '@luft/ui';
	import Loaded from '../../../components/Loaded.svelte';
	import { count, PLATFORM_NAMES } from '../../../format';
	import { reads } from '../../../state/reads';
	import type { Project } from '../../../store';
	import BarList from './BarList.svelte';
	import DailyChart from './DailyChart.svelte';
	import { everyDay } from './scale';

	const PERIODS = [
		{ value: 7, label: '7 days' },
		{ value: 30, label: '30 days' },
		{ value: 90, label: '90 days' }
	];

	let { project }: { project: Project } = $props();

	let days = $state(30);
	let measure = $state<'installs' | 'updates'>('installs');

	const stats = $derived(reads.stats(project.app.id, days));
	const installs = $derived(project.app.format === 'files' ? 'Downloads' : 'Installs');

	$effect(() => stats.watch());
</script>

<div class="-mt-3 -mb-3 flex justify-end">
	<Segmented label="Period" value={days} options={PERIODS} onchange={(value) => (days = value)} />
</div>

<Loaded resource={stats}>
	{#snippet children(data)}
		{@const busiest = Math.max(0, ...data.days.map((day) => day.installs))}
		<div class="totals" class:opacity-60={stats.loading}>
			<p><span class="number">{count(data.total.installs)}</span><span class="label">{installs}</span></p>
			<p><span class="number">{count(data.total.updates)}</span><span class="label">Updates</span></p>
			<p><span class="number">{count(busiest)}</span><span class="label">On the busiest day</span></p>
		</div>
		<div class="plot">
			<DailyChart days={everyDay(data.days, days)} {installs} />
		</div>
		<div class="flex justify-end">
			<Segmented
				label="Measure"
				value={measure}
				options={[
					{ value: 'installs', label: installs },
					{ value: 'updates', label: 'Updates' }
				]}
				onchange={(value) => (measure = value)}
			/>
		</div>
		<div class="-mt-3 grid grid-cols-2 gap-6">
			<Section title="By version">
				<BarList rows={data.versions.map((row) => ({ label: row.version, value: row[measure] }))} />
			</Section>
			<Section title="By system">
				<BarList rows={data.platforms.map((row) => ({ label: PLATFORM_NAMES[row.platform], value: row[measure] }))} />
			</Section>
		</div>
	{/snippet}
</Loaded>

<style>
	.totals {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		padding-inline: 6px;
		transition: opacity var(--motion-quick) var(--ease-decelerate);
	}

	.totals p {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.number {
		font-size: 28px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.label {
		font-size: 13px;
		color: var(--text-muted);
	}

	.plot {
		border-radius: var(--radius-group);
		background: var(--surface);
		padding: 16px 18px 12px;
	}
</style>
