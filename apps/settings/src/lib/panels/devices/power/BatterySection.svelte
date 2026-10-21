<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import { ProgressBar, Row, Section, Switch, watts } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import type { Battery } from './api';
	import ChargeLimit from './ChargeLimit.svelte';
	import { duration, wattHours } from './format';

	const LOW_LEVEL = 10;

	let { battery }: { battery: Battery } = $props();

	const desktop = useSettings<{ 'show-battery-percentage': boolean }>('org.gnome.desktop.interface', ['show-battery-percentage']);

	let power = $derived(battery.rate === null ? null : watts(battery.rate));
	let status = $derived.by(() => {
		switch (battery.charge) {
			case 'charging': {
				if (battery.untilFull <= 0) return power ? t('settings-power-charging-at', { power }) : t('settings-power-charging');
				const time = duration(battery.untilFull);
				return power ? t('settings-power-charging-at-until-full', { power, time }) : t('settings-power-charging-until-full', { time });
			}
			case 'discharging': {
				if (battery.untilEmpty <= 0) return power ? t('settings-power-on-battery-using', { power }) : t('settings-power-on-battery');
				const time = duration(battery.untilEmpty);
				return power ? t('settings-power-time-left-using', { power, time }) : t('settings-power-time-left', { time });
			}
			case 'full':
				return t('settings-power-full');
			case 'empty':
				return t('settings-power-empty');
			case 'not-charging':
				return t('settings-power-not-charging');
		}
	});
	let health = $derived(battery.capacity ? battery.capacity.full / battery.capacity.design : null);
	let wear = $derived(
		[
			battery.capacity && t('settings-power-capacity', { full: wattHours(battery.capacity.full), design: wattHours(battery.capacity.design) }),
			battery.cycles.length && cycles(battery.cycles)
		]
			.filter(Boolean)
			.join(' · ')
	);

	function cycles(counts: number[]) {
		const number = new Intl.NumberFormat(i18n.formats);
		const list = new Intl.ListFormat(i18n.formats).format(counts.map((count) => number.format(count)));
		return t('settings-power-cycles', { cycles: list, count: counts[counts.length - 1] });
	}
</script>

<Section title={t('settings-power-battery')}>
	<Row title={percent(battery.level / 100)} description={status}>
		{#snippet below()}
			<ProgressBar fraction={battery.level / 100} class={[battery.charge === 'discharging' && battery.level <= LOW_LEVEL && '[--progress-color:var(--danger)]']} />
		{/snippet}
	</Row>
	{#if wear}
		<Row title={t('settings-power-health')} description={wear}>
			{#if health !== null}
				<span class="tabular-nums">{percent(Math.min(health, 1))}</span>
			{/if}
		</Row>
	{/if}
	<Row title={t('settings-power-show-percentage')} description={t('settings-power-show-percentage-description')}>
		<Switch
			label={t('settings-power-show-percentage')}
			checked={desktop.values['show-battery-percentage'] ?? false}
			onchange={(on) => desktop.set('show-battery-percentage', on)}
		/>
	</Row>
	{#if battery.limit}
		<ChargeLimit limit={battery.limit} />
	{/if}
</Section>
