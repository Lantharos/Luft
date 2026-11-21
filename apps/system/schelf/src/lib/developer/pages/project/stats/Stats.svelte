<script lang="ts">
	import { t } from '@luft/i18n';
	import { Section, Segmented } from '@luft/ui';
	import Loaded from '../../../components/Loaded.svelte';
	import { count, platformName, sourceName } from '../../../format';
	import { reads } from '../../../state/reads';
	import type { Project } from '../../../store';
	import BarList from './BarList.svelte';
	import DailyChart from './DailyChart.svelte';
	import { everyDay } from './scale';

	const PERIODS = [7, 30, 90];

	let { project }: { project: Project } = $props();

	let days = $state(30);
	let measure = $state<'installs' | 'updates'>('installs');

	const stats = $derived(reads.stats(project.app.id, days));
	const downloads = $derived(project.app.format === 'files');
	const installs = $derived(t(downloads ? 'developer-stats-downloads' : 'developer-stats-installs'));
	const periods = $derived(PERIODS.map((value) => ({ value, label: t('developer-stats-days', { count: value }) })));

	$effect(() => stats.watch());
</script>

<div class="-mt-3 -mb-3 flex justify-end">
	<Segmented label={t('developer-stats-period')} value={days} options={periods} onchange={(value) => (days = value)} />
</div>

<Loaded resource={stats}>
	{#snippet children(data)}
		{@const busiest = Math.max(0, ...data.days.map((day) => day.installs))}
		<div class="totals" class:opacity-60={stats.loading}>
			<p><span class="number">{count(data.total.installs)}</span><span class="label">{installs}</span></p>
			<p><span class="number">{count(data.total.updates)}</span><span class="label">{t('developer-stats-updates')}</span></p>
			<p><span class="number">{count(busiest)}</span><span class="label">{t('developer-stats-busiest')}</span></p>
		</div>
		<div class="plot">
			<DailyChart days={everyDay(data.days, days)} {downloads} />
		</div>
		<div class="flex justify-end">
			<Segmented
				label={t('developer-stats-measure')}
				value={measure}
				options={[
					{ value: 'installs', label: installs },
					{ value: 'updates', label: t('developer-stats-updates') }
				]}
				onchange={(value) => (measure = value)}
			/>
		</div>
		<div class="-mt-3 grid grid-cols-3 gap-6">
			<Section title={t('developer-stats-by-version')}>
				<BarList rows={data.versions.map((row) => ({ label: row.version, value: row[measure] }))} />
			</Section>
			<Section title={t('developer-stats-by-system')}>
				<BarList rows={data.platforms.map((row) => ({ label: platformName(row.platform), value: row[measure] }))} />
			</Section>
			<Section title={t('developer-stats-by-source')}>
				<BarList rows={data.sources.map((row) => ({ label: sourceName(row.source), value: row[measure] }))} />
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
